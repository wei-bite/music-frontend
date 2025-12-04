<script setup>
import { userCreateService, userGetListService, userUpdateService, userDeleteService} from "@/api/user";
import { onMounted, ref } from "vue";
import { formatTime } from "@/utils/format";
import { View,Edit,Delete } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";

const dialogVisible = ref()//显示/隐藏抽屉
const total = ref(0) // 总条数
const loading = ref(false) // 加载状态
const userList = ref([]) // 用户列表数据
const isEdit = ref(false) // 是否为编辑模式
const userInfo = ref({})// 存储当前编辑的用户信息

const params = ref({
  role: '', // 角色筛选
  page: 1, // 当前页码
  size: 10, // 每页条数
  keyword: '' // 关键词搜索
})



const getUserList = async () => {
  loading.value = true // 开始加载
  // 调用接口
  const res = await userGetListService(params.value)
  console.log(res.data.records);
  userList.value = res.data.records // 假设接口返回的数据在 res.data.users
  total.value = res.data.total // 假设接口返回的总条数在 res.data.total
  loading.value = false // 结束加载
  }  

// 组件挂载时获取数据
onMounted(() => {
  getUserList()
})

// 搜索 
const onSearch = () => {
  params.value.page = 1
  getUserList()
}
// 重置
const onReset = () => {
  params.value.role = ''
   params.value.keyword = ''
  params.value.page = 1
  getUserList()
}

// 处理分页逻辑 - 每页条数变化
const handlePageChange = (page) => {
  params.value.page = page
  getUserList()
}
// 处理分页逻辑 - 页码变化
const handleSizeChange = (size) => {
  params.value.size = size
  params.value.page = 1
  getUserList()
}

// 创建用户窗口
const openCreateDialog = () => {
  dialogVisible.value = true;
  isEdit.value = false

};

const router = useRouter()
// 跳转到用户详情页
const goToDetail = (userId) => {
  router.push(`/user1/detail?id=${userId}`)
}


// 编辑用户
const openEditDialog = (row) => {
   userInfo.value = {
    id: row.id,
    username: row.username || '',
    name: row.name || '',
    role: row.role || '',
    email: row.email || '',
    phone: row.phone || '',
    gender: row.gender || '男', 
    address: row.address || ''       
  } 
  // 这里可以传递用户数据到抽屉组件
  dialogVisible.value = true;
   isEdit.value = true
  console.log("编辑用户数据:", row);
};

// 删除用户
const handleDelete = async (userId) => {
  await userDeleteService(userId)
  ElMessage.success('删除成功')
  await getUserList()
};

// 处理表单提交
const handleFormSubmit = async (formData) => {
  loading.value = true
  try {
    if (isEdit.value) {
      // 传入 ID 和表单数据
      await userUpdateService(userInfo.value.id, formData)
      ElMessage.success('更新成功')
    } else {
      await userCreateService(formData)
      ElMessage.success('创建成功')
    }
    await getUserList()
    dialogVisible.value = false
  } catch (err) {
    console.error(err)
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="user-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="openCreateDialog">新增用户</el-button>
        </div>
      </template>

      <!-- 搜索区 -->
      <el-form inline>
        <el-form-item label="角色">
          <el-select clearable v-model="params.role" placeholder="全部">
            <el-option label="学生" value="student" />
            <el-option label="老师" value="teacher" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model.trim="params.keyword"
            placeholder="用户名/姓名"
            clearable
            style="width: 200px"
            @keyup.enter="onSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">查询</el-button>
          <el-button  @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 用户表格（静态示例） -->
      <el-table v-loading="loading" :data="userList" style="width: 100%">
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="role" label="角色">
          <template #default="{ row }">
            <el-tag type="info">{{row.role}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="avatar" label="头像" width="100">
          <template #default="{ row }">
            <el-image
              style="width: 40px; height: 40px; border-radius: 50%;"
              :src="'http://localhost:8080' + row.avatar || '@/assets/user.png'"
              fit="cover"
            />
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" ></el-table-column>
        <el-table-column prop="phone" label="电话" ></el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160" >
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="220">
          <template #default="{ row }">
            <!-- 查看 -->
            <el-button type="primary" @click="goToDetail(row.id)">
              <el-icon><View /></el-icon>
            </el-button>
            <!-- 编辑 -->
            <el-button type="warning" @click="openEditDialog(row)">
              <el-icon><Edit /></el-icon>
            </el-button>

            <!-- 删除 -->
            <el-button type="danger" @click="handleDelete(row.id)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>

      <!-- 没数据时显示 -->
      <template #empty>
        <el-empty description="这个人很懒什么都没留下来 " />
      </template>
      </el-table>

      <!-- 分页（静态） -->
      <el-pagination
        :total="total"
        layout="total, prev, pager, next"
        v-model:page-size="params.size"
        v-model:current-page="params.page"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
        style="margin-top: 16px; "
      />
    </el-card>

    <user-form-drawer @submit="handleFormSubmit" v-model="dialogVisible" :is-edit="isEdit" :initialData="userInfo"/>
  </div>
</template>

<style lang="scss" scoped>
$primary-color: #409eff;
$border-color: #ebeef5;
$bg-light: #f5f7fa;
$card-bg: #ffffff;
$text-color: #333;
$text-secondary: #666;

.user-management {
  background-color: $bg-light;
  min-height: 100vh;

  .el-card {
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    background: $card-bg;
    overflow: hidden;

    :deep(.card-header) {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      font-size: 16px;
      font-weight: 600;
      color: $text-color;
      border-bottom: 1px solid $border-color;
    }

    :deep(.el-form) {
      padding: 16px 20px;
      background: #f9fafb;
      border-top: 1px solid $border-color;
      border-bottom: 1px solid $border-color;

      .el-form-item {
        margin-bottom: 0;
              .el-input {
        --el-input-width: 120px;
      }

      .el-select {
        --el-select-width: 120px;
      }

        .el-form-item__label {
          font-weight: 500;
          color: $text-secondary;
        }
      }
    }

    :deep(.el-table) {
      border-radius: 6px;
      overflow: hidden;


      th {
        background-color: $bg-light;
        font-weight: 600;
        color: $primary-color;
        font-size: 16px;
        text-align: center;
        padding: 12px 0;
        border-bottom: 1px solid $border-color;
      }

      td {
        padding: 12px 0;
        font-size: 16px;
        text-align: center;
      }

      .el-tag {
        font-size: 12px;
        padding: 4px 8px;

        &--success {
          background-color: #e6f7ef;
          border-color: #b3f5c0;
          color: #389e3c;
        }

        &--info {
          background-color: #f0f5ff;
          border-color: #a0d9ff;
          color: #1989fa;
        }
      }

      .el-button {
        padding: 6px 12px;
        font-size: 12px;

        &--small {
          padding: 5px 10px;
          font-size: 12px;
        }
      }
    }

    :deep(.el-pagination) {
      display: flex;
      justify-content: center;
      margin: 20px 0;
      padding: 0 20px;
      background: $card-bg;

      .el-pagination__total,
      .el-pagination__jump {
        font-size: 14px;
        color: $text-secondary;
      }

      .el-pagination__number {
        min-width: 32px;
        height: 32px;
        line-height: 32px;
        font-size: 14px;
        margin: 0 4px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;

        &:hover {
          background-color: #f5f7fa;
        }

        &.active {
          background-color: $primary-color;
          color: white;
          border-color: $primary-color;
        }
      }

      .el-pagination__prev,
      .el-pagination__next {
        min-width: 32px;
        height: 32px;
        line-height: 32px;
        font-size: 14px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
      }
    }
  }
}
</style>