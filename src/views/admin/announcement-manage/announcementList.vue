<template>
  <GenericListManager
    title="公告管理"
    :columns="columns"
    :searchFields="searchFields"
    :list="list"
    :total="total"
    :loading="loading"
    :pagination="pagination"
    :search-params="searchParams"
    :show-view-btn="true"
    @search="handleSearch"
    @reset="handleReset"
    @page-change="handlePageChange"
    @size-change="handleSizeChange"
    @create="openCreate"
    @edit="openEdit"
    @delete="handleDelete"
    @view-detail="openView"
  >
    <!-- 类型列：自定义渲染为 Tag -->
    <template #col-type="{ row }">
      <el-tag :type="getTypeTagType(row.type)">
        {{ getTypeLabel(row.type) }}
      </el-tag>
    </template>

    <!-- 时间范围列 -->
    <template #col-timeRange="{ row }">
      {{ formatTimeRange(row.startTime, row.endTime) }}
    </template>

    <!-- 创建时间列 -->
    <template #col-createdAt="{ row }">
      {{ formatDate(row.createdAt) }}
    </template>
  </GenericListManager>

  <!-- 表单弹窗（新建/编辑/查看） -->
  <AnnouncementFormDialog
    v-model="dialogVisible"
    :mode="dialogMode"
    :announcement-id="currentId"
    @success="loadList"
  />
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

// 引入你的通用组件
import GenericListManager from '@/components/GenericListManager.vue'
// // 引入公告表单弹窗（需你实现）
import AnnouncementFormDialog from '@/views/admin/announcement-manage/components/AnnouncementFormDialog.vue'

// API
import {
  getAnnouncementsService,
  deleteAnnouncementService
} from '@/api/admin/announcement'

// ====== 配置项 ======
const columns = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'title', label: '标题', minWidth: '200' },
  { prop: 'type', label: '类型', width: 100 },
  { prop: 'timeRange', label: '生效时间', width: 220 }, // 虚拟字段，靠插槽渲染
  { prop: 'createdAt', label: '创建时间', width: 180 }
]

const searchFields = [
  {
    prop: 'type',
    label: '类型',
    type: 'select',
    placeholder: '请选择类型',
    options: [
      { value: '', label: '全部' },
      { value: 'notice', label: '通知' },
      { value: 'activity', label: '活动' },
      { value: 'promotion', label: '促销' }
    ]
  }
]

// ====== 响应式数据 ======
const list = ref([])
const total = ref(0)
const loading = ref(false)

const pagination = reactive({
  page: 1,
  size: 10
})

const searchParams = reactive({
  type: ''
})

const dialogVisible = ref(false)
const dialogMode = ref('create') // 'create' | 'edit' | 'view'
const currentId = ref(null)

// ====== 工具函数 ======
const getTypeLabel = (type) => {
  const map = { notice: '通知', activity: '活动', promotion: '促销' }
  return map[type] || type
}

const getTypeTagType = (type) => {
  const map = { notice: '', activity: 'success', promotion: 'warning' }
  return map[type] || ''
}

const formatTimeRange = (start, end) => {
  return `${dayjs(start).format('MM-DD HH:mm')} ~ ${dayjs(end).format('MM-DD HH:mm')}`
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// ====== 数据加载 ======
const loadList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.size,
      ...searchParams
    }
    const res = await getAnnouncementsService(params)
    if (res.code === 200) {
      list.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } catch (err) {
    ElMessage.error('加载公告列表失败')
  } finally {
    loading.value = false
  }
}

// ====== 事件处理 ======
const handleSearch = () => {
  pagination.page = 1
  loadList()
}

const handleReset = () => {
  searchParams.type = ''
  pagination.page = 1
  loadList()
}

const handlePageChange = (page) => {
  pagination.page = page
  loadList()
}

const handleSizeChange = (size) => {
  pagination.size = size
  loadList()
}

const openCreate = () => {
  dialogMode.value = 'create'
  currentId.value = null
  dialogVisible.value = true
}

const openEdit = (row) => {
  dialogMode.value = 'edit'
  currentId.value = row.id
  dialogVisible.value = true
}

const openView = (id) => {
  dialogMode.value = 'view'
  currentId.value = id
  dialogVisible.value = true
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除此公告？', '提示', {
      type: 'warning'
    })
    await deleteAnnouncementService(id)
    ElMessage.success('公告已删除')
    loadList()
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 初始化
onMounted(() => {
  loadList()
})
</script>