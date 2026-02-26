<template>
  <div class="salary-list-container">
    <el-card shadow="never" style="border-radius: 8px; border: 1px solid #e4e7ed;">
      <template #header>
        <div class="clearfix">
          <span>工资列表</span>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchParams" @submit.prevent="handleSearch">
          <el-form-item label="教师姓名">
            <el-input v-model="searchParams.teacherName" placeholder="请输入姓名" clearable />
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="searchParams.dateRange"
              type="monthrange"
              range-separator="至"
              start-placeholder="开始月份"
              end-placeholder="结束月份"
              format="YYYY-MM"
              value-format="YYYY-MM"
              clearable
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchParams.status" placeholder="全部" clearable style="width: 100px">
              <el-option value="pending" label="待发放" />
              <el-option value="paid" label="已发放" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 工具栏 -->
      <div class="toolbar">
        <el-button type="primary" @click="handleCreate">新增工资记录</el-button>
      </div>

      <!-- 表格 -->
      <el-table :data="rawList" style="width: 100%" v-loading="loading" border>
        <el-table-column prop="teacherName" label="教师姓名" min-width="100" align="center" />
        <el-table-column prop="month" label="工资月份" min-width="100" align="center" />
        <el-table-column prop="baseSalary" label="基本工资" min-width="100" align="center">
          <template #default="{ row }">¥{{ row.baseSalary }}</template>
        </el-table-column>
        <el-table-column prop="lessonBonus" label="课时奖金" min-width="100" align="center">
          <template #default="{ row }">¥{{ row.lessonBonus }}</template>
        </el-table-column>
        <el-table-column prop="deductions" label="扣款" min-width="100" align="center">
          <template #default="{ row }">¥{{ row.deductions }}</template>
        </el-table-column>
        <el-table-column prop="totalSalary" label="实发工资" min-width="100" align="center">
          <template #default="{ row }"><strong>¥{{ row.totalSalary }}</strong></template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 'paid' ? 'success' : 'warning'"
              size="small"
              class="status-tag"
            >
              {{ row.status === 'paid' ? '已发放' : '待发放' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" min-width="160" align="center">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" min-width="180" align="center">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button size="small" @click="handleDetail(row.id)">详情</el-button>
              <el-button size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
              <el-button
                size="small"
                type="success"
                @click="handleDistribute(row.id)"
                v-if="row.status === 'pending'"
              >
                发放
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        background
        layout="total, prev, pager, next"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handlePageChange"
        class="pagination"
      />
    </el-card>

    <!-- 编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" @close="resetForm">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="教师" prop="teacherId">
          <el-select v-model="form.teacherId" placeholder="请选择教师" :disabled="!!form.id" filterable>
            <el-option
              v-for="t in teacherList"
              :key="t.id"
              :label="t.name"
              :value="t.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="工资月份" prop="month">
          <el-date-picker
            v-model="form.month"
            type="month"
            placeholder="选择年月"
            format="YYYY-MM"
            value-format="YYYY-MM"
            :disabled="!!form.id"
          />
        </el-form-item>
        <el-form-item label="基本工资" prop="baseSalary">
          <el-input v-model.number="form.baseSalary" />
        </el-form-item>
        <el-form-item label="课时奖金" prop="lessonBonus">
          <el-input v-model.number="form.lessonBonus" />
        </el-form-item>
        <el-form-item label="扣款" prop="deductions">
          <el-input v-model.number="form.deductions" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">
          {{ dialogTitle === '新增工资记录' ? '保存' : '更新' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getSalaryListService,
  createSalaryService,
  updateSalaryService,
  deleteSalaryService,
  distributeSalaryService,
  getSalaryDetailService,
  getAllTeachersService
} from '@/api/admin/operation'

// ================== 数据 ==================
const loading = ref(false)
const rawList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const teacherList = ref([])

const searchParams = ref({
  teacherName: '',
  dateRange: [],
  status: ''
})

const dialogVisible = ref(false)
const formRef = ref()
const form = ref({
  id: null,
  teacherId: null,
  month: '',
  baseSalary: 0,
  lessonBonus: 0,
  deductions: 0,
  status: 'pending'
})
const rules = {
  teacherId: [{ required: true, message: '请选择教师', trigger: 'change', type: 'number' }],
  month: [{ required: true, message: '请选择年月', trigger: 'change' }]
}

const dialogTitle = computed(() => form.value.id ? '编辑工资记录' : '新增工资记录')

// ================== 方法 ==================
const loadSalaryList = async () => {
  loading.value = true
  const startMonth = searchParams.value.dateRange?.[0] || undefined
  const endMonth = searchParams.value.dateRange?.[1] || undefined

  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      teacherName: searchParams.value.teacherName || undefined,
      startMonth,
      endMonth,
      status: searchParams.value.status || undefined
    }

    const res = await getSalaryListService(params)
    if (res.code === 200) {
      rawList.value = Array.isArray(res.data.records) ? res.data.records : []
      total.value = res.data.total || 0
    } else {
      ElMessage.error(res.message || '加载失败')
      rawList.value = []
      total.value = 0
    }
  } catch (err) {
    ElMessage.error('网络错误，请重试')
    console.error(err)
    rawList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadSalaryList()
}

const handleReset = () => {
  searchParams.value = {
    teacherName: '',
    dateRange: [],
    status: ''
  }
  currentPage.value = 1
  loadSalaryList()
}

// ✅ 关键修改：设置默认月份为当前年月（yyyy-MM）
const handleCreate = () => {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  form.value = {
    id: null,
    teacherId: null,
    month: currentMonth, 
    baseSalary: 0,
    lessonBonus: 0,
    deductions: 0,
    status: 'pending'
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDetail = async (id) => {
  try {
    const res = await getSalaryDetailService(id)
    if (res.code === 200) {
      const data = res.data
      const formattedData = {
        ID: data.id,
        教师ID: data.teacherId,
        教师姓名: data.teacherName || '未填写',
        工资月份: data.month,
        基本工资: `¥${data.baseSalary}`,
        课时奖金: `¥${data.lessonBonus}`,
        扣款: `¥${data.deductions}`,
        实发工资: `¥${data.totalSalary}`,
        状态: data.status === 'paid' ? '已发放' : '待发放',
        创建时间: new Date(data.createdAt).toLocaleString()
      }
      ElMessageBox.alert(
        `<div style="font-family: sans-serif; line-height: 1.6; color: #333;">` +
        Object.entries(formattedData)
          .map(([key, value]) => `<strong>${key}：</strong> ${value}`)
          .join('<br>') +
        `</div>`,
        '工资详情',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确定',
          showClose: true
        }
      )
    } else {
      ElMessage.error(res.message || '获取详情失败')
    }
  } catch (err) {
    ElMessage.error('获取详情失败，请重试')
  }
}

const handleDelete = async (id) => {
  ElMessageBox.confirm('确定要删除这条工资记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteSalaryService(id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        loadSalaryList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (err) {
      ElMessage.error('删除失败，请重试')
    }
  })
}

const handleDistribute = async (id) => {
  try {
    const res = await distributeSalaryService(id)
    if (res.code === 200) {
      ElMessage.success('发放成功')
      loadSalaryList()
    } else {
      ElMessage.error(res.message || '发放失败')
    }
  } catch (err) {
    ElMessage.error('发放失败，请重试')
  }
}

const submitForm = async () => {
  await formRef.value?.validate()
  try {
    if (form.value.id) {
      const res = await updateSalaryService(form.value.id, form.value)
      if (res.code === 200) {
        ElMessage.success('更新成功')
        dialogVisible.value = false
        loadSalaryList()
      } else {
        ElMessage.error(res.message || '更新失败')
      }
    } else {
      const res = await createSalaryService(form.value)
      if (res.code === 200) {
        ElMessage.success('添加成功')
        dialogVisible.value = false
        loadSalaryList()
      } else {
        ElMessage.error(res.message || '添加失败')
      }
    }
  } catch (err) {
    ElMessage.error('操作失败，请重试')
  }
}

const resetForm = () => {
  formRef.value?.resetFields()
}

const handlePageChange = (page) => {
  currentPage.value = page
  loadSalaryList()
}

const formatDateTime = (str) => {
  if (!str) return ''
  const date = new Date(str)
  if (isNaN(date.getTime())) return str
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(/\//g, '-')
}

// 方法
const loadTeacherList = async () => {
  try {
    const res = await getAllTeachersService()
    if (res.code === 200) {
      teacherList.value = res.data || []
    }
  } catch (err) {
    console.error('获取教师列表失败', err)
  }
}

onMounted(() => {
  loadSalaryList()
  loadTeacherList()
})
</script>

<style scoped lang="scss">
.salary-list-container {
  padding: 20px;
  background-color: #f5f7fa;

  .el-card {
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    border: 1px solid #e4e7ed;

    .clearfix {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 16px;
    }

    .search-bar {
      margin-bottom: 16px;
      background: white;
      padding: 12px 16px;
      border-radius: 4px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

      .el-form-item {
        margin-right: 16px;
        margin-bottom: 0;
      }
    }

    .toolbar {
      margin-bottom: 16px;
      display: flex;
      justify-content: flex-end;
    }

    .el-table {
      margin-top: 8px;
      font-size: 14px;

      :deep(.el-table__cell) {
        padding: 12px 16px;
        text-align: center;
      }

      :deep(.el-table__header-wrapper th) {
        background-color: #f9f9f9;
        font-weight: 500;
        color: #666;
      }

      :deep(.el-table__row .action-buttons) {
        display: flex;
        gap: 8px;
        justify-content: center;
        flex-wrap: wrap;

        .el-button {
          padding: 6px 12px;
          font-size: 12px;
          height: auto;
        }
      }
    }

    .pagination {
      margin-top: 24px;
      text-align: right;
      padding: 16px 0;
    }
  }

  .status-tag {
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 4px;
  }
}
</style>