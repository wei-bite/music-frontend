<!-- src/views/admin/schedule-manage/scheduleList.vue -->
<template>
  <el-card>
    <!-- 🔍 自定义搜索区域 -->
    <div class="custom-search-bar">
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="教师">
          <el-input
            v-model="fuzzySearch.teacherName"
            placeholder="模糊搜索"
            clearable
            style="width: 160px"
          />
        </el-form-item>

        <el-form-item label="学生">
          <el-input
            v-model="fuzzySearch.studentName"
            placeholder="模糊搜索"
            clearable
            style="width: 160px"
          />
        </el-form-item>

        <el-form-item label="课程">
          <el-input
            v-model="fuzzySearch.courseName"
            placeholder="模糊搜索"
            clearable
            style="width: 160px"
          />
        </el-form-item>

        <el-form-item label="日期">
          <el-date-picker
            v-model="fuzzySearch.date"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 160px"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button type="refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 📋 表格 -->
    <GenericListManager
      title="排课管理"
      :columns="columns"
      :list="scheduleList"
      :total="total"
      :loading="loading"
      :pagination="pagination"
      :show-search="false"
      :show-view-btn="true"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      @create="handleCreate"
      @edit="handleEdit"
      @delete="handleCancel"
      @view-detail="handleView"
    >
      <template #col-teacherName="{ row }">
        {{ row.teacherName || '—' }}
      </template>

      <template #col-studentName="{ row }">
        {{ row.studentName || '—' }}
      </template>

      <template #col-startTime="{ row }">
        {{ formatDateTime(row.startTime) }}
      </template>


      <template #col-status="{ row }">
        <el-tag :type="getStatusType(row.status)" size="small">
          {{ getStatusText(row.status) }}
        </el-tag>
      </template>

      
    </GenericListManager>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import GenericListManager from '@/components/GenericListManager.vue'
import { useRouter, useRoute } from 'vue-router'

// API
import {
  getScheduleListService,
  cancelScheduleService
} from '@/api/admin/schedule'

const router = useRouter()
const route = useRoute() // ✅ 新增：用于监听路由

// ====== 状态 ======
const loading = ref(false)
const scheduleList = ref([])
const total = ref(0)

const pagination = reactive({
  page: 1,
  size: 10
})

const fuzzySearch = reactive({
  teacherName: '',
  studentName: '',
  courseName: '',
  date: null
})

// ====== 列配置 ======
const columns = [
  { prop: 'id', label: '课节ID', width: 90 },
  { prop: 'courseName', label: '课程', minWidth: 150 },
  { prop: 'teacherName', label: '教师', minWidth: 120 },
  { prop: 'studentName', label: '学生', minWidth: 120 },
  { prop: 'roomName', label: '琴房', minWidth: 120 },
  { prop: 'startTime', label: '开始时间', minWidth: 160 },
  { prop: 'duration', label: '时长(分钟)', width: 100 },
  { prop: 'status', label: '状态', width: 100 }
]

// ====== 工具函数 ======
const formatDateTime = (isoStr) => {
  return isoStr ? dayjs(isoStr).format('YYYY-MM-DD HH:mm') : '—'
}

const getStatusType = (status) => {
  switch (status) {
    case 'completed': return 'success'
    case 'scheduled': return 'info'
    case 'cancelled': return 'danger'
    default: return 'info'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'completed': return '已完成'
    case 'scheduled': return '已安排'
    case 'cancelled': return '已取消'
    default: return '未知'
  }
}

// ====== 获取列表 ======
const fetchList = async () => {
  loading.value = true
  try {
    let dateStr = ''
    if (fuzzySearch.date) {
      const formatted = dayjs(fuzzySearch.date).format('YYYY-MM-DD')
      if (dayjs(formatted).isValid()) {
        dateStr = formatted
      }
    }

    const params = {
      page: pagination.page,
      size: pagination.size,
      teacherName: fuzzySearch.teacherName || undefined,
      studentName: fuzzySearch.studentName || undefined,
      courseName: fuzzySearch.courseName || undefined,
      date: dateStr || undefined
    }

    const res = await getScheduleListService(params)
    scheduleList.value = res.data.records || []
    total.value = res.data.total || 0
  } catch (error) {
    ElMessage.error('获取排课列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// ====== 事件处理 ======
const handleSearch = () => {
  pagination.page = 1
  fetchList()
}

const handleReset = () => {
  Object.assign(fuzzySearch, {
    teacherName: '',
    studentName: '',
    courseName: '',
    date: null
  })
  pagination.page = 1
  fetchList()
}

const handlePageChange = (page) => {
  pagination.page = page
  fetchList()
}

const handleSizeChange = (size) => {
  pagination.size = size
  fetchList()
}

const handleCreate = () => {
  router.push({ name: 'ScheduleForm', query: { mode: 'create' } })
}

const handleEdit = (row) => {
  const id = row?.id
  if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
    ElMessage.warning('无效的排课记录')
    return
  }
  router.push({
    name: 'ScheduleForm',
    query: { mode: 'edit', id: String(id) }
  })
}

const handleView = (id) => {
  if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
    ElMessage.warning('无效的课节ID')
    return
  }
  router.push({
    name: 'ScheduleDetail',
    params: { id: String(id) }
  })
}

const handleCancel = async (id) => {
  if (!id) {
    ElMessage.warning('无效记录')
    return
  }
  try {
    await ElMessageBox.confirm('确定取消该课程？', '提示', { type: 'warning' })
    await cancelScheduleService(id)
    ElMessage.success('取消成功')
    fetchList()
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

// ✅ 关键修复：监听路由，每次进入 /schedule/list 都刷新
watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/admin/schedule/list' || newPath === '/schedule/list') {
      fetchList()
    }
  }
)

// 初始化
onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.custom-search-bar {
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 16px;
}

.custom-search-bar ::v-deep(.el-form-item) {
  margin-bottom: 0;
}

.custom-search-bar ::v-deep(.el-form-item__label) {
  font-weight: normal;
  color: #606266;
}
</style>