<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatTime } from '@/utils/format'
import {
  getDeletedCourseListService,
  restoreCourseService
} from '@/api/admin/admin'

const router = useRouter()

const courseList = ref([])
const total = ref(0)
const loading = ref(false)

// ✅ 修正：使用 pageSize（匹配后端）
const params = ref({
  courseName: '',
  page: 1,
  pageSize: 10 // ← 关键：不是 size！
})

// 加载已删除课程列表
const loadList = async () => {
  loading.value = true
  try {
    const res = await getDeletedCourseListService({
      page: params.value.page,
      pageSize: params.value.pageSize, // 正确参数名
      courseName: params.value.courseName?.trim() || undefined
    })

    // 修正：从 records 取列表，total 取总数
    courseList.value = res.data.records || []
    total.value = res.data.total || 0
  } catch (err) {
    ElMessage.error('加载已删除课程失败')
    courseList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  params.value.page = 1
  loadList()
}

// 重置
const handleReset = () => {
  params.value.courseName = ''
  params.value.page = 1
  loadList()
}

// 分页
const handlePageChange = (page) => {
  params.value.page = page
  loadList()
}

const handleSizeChange = (pageSize) => {
  params.value.pageSize = pageSize // ✅ 不是 size
  params.value.page = 1
  loadList()
}

// 恢复课程
const handleRestore = async (id) => {
  try {
    await ElMessageBox.confirm('确定恢复该课程？', '提示', {
      type: 'info',
      confirmButtonText: '恢复',
      cancelButtonText: '取消'
    })

    await restoreCourseService(id)
    ElMessage.success('课程恢复成功')
    loadList()
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('恢复失败')
    }
  }
}

onMounted(() => {
  loadList()
})
</script>

<template>
  <div class="course-recover">
    <el-card>
      <!-- 卡片 header -->
      <template #header>
        <div class="recover-header">
          <span>课程恢复</span>
          <el-button @click="$router.back()">返回</el-button>
        </div>
      </template>

      <!-- 搜索区 -->
      <el-form :inline="true" class="search-form">
        <el-form-item label="课程名称">
          <el-input
            v-model.trim="params.courseName"
            placeholder="请输入课程名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="courseList"
        style="width: 100%; margin-top: 16px"
        border
      >
        <el-table-column prop="courseName" label="课程名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="duration" label="课时(分钟)" width="120" align="center" />
        <el-table-column prop="price" label="价格(元)" width="120" align="center">
          <template #default="{ row }">
            <el-tag type="success" size="small">
              ¥{{ Number(row.price).toFixed(2) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="deletedAt" label="删除时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatTime(row.deletedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleRestore(row.id)">
              恢复
            </el-button>
          </template>
        </el-table-column>

        <template #empty>
          <el-empty description="暂无已删除的课程" />
        </template>
      </el-table>

      <!-- 分页（独立组件，不包裹任何东西） -->
      <el-pagination
        v-if="total > 0"
        :current-page="params.page"
        :page-size="params.pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 20, 50]"
        style="margin-top: 20px; text-align: right"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </el-card> <!-- 注意：el-card 在这里才闭合 -->
  </div>
</template>

<style lang="scss" scoped>
.course-recover {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;

  .el-card {
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .recover-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 18px;
      font-weight: 600;
    }

    .search-form {
      background-color: #f9fafb;
      padding: 16px;
      border-radius: 6px;
      margin-bottom: 16px;

      .el-form-item {
        margin-right: 20px;
        margin-bottom: 0;
      }
    }

    :deep(.el-table) {
      border-radius: 6px;
      overflow: hidden;

      th {
        background-color: #f5f7fa;
        color: #409eff;
        font-weight: 600;
      }
    }

    :deep(.el-pagination) {
      padding: 16px 0;
    }
  }
}
</style>