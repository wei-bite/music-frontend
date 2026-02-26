<!-- src/views/admin/course-manage/CourseList.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatTime } from '@/utils/format'

import {
  getCourseListService,
  createCourseService,
  updateCourseService,
  deleteCourseService
} from '@/api/admin/admin'

import GenericListManager from '@/components/GenericListManager.vue'
import GenericFormDrawer from '@/components/GenericFormDrawer.vue'

const router = useRouter()

const dialogVisible = ref(false)
const isEdit = ref(false)
const courseInfo = ref({})
const courseList = ref([])
const total = ref(0)
const loading = ref(false)

const params = ref({
  courseName: '',
  teacherName: '',
  page: 1,
  size: 10
})

const columns = [
  { prop: 'courseName', label: '课程名称', width: 200 },
  { prop: 'duration', label: '课时(分钟)', width: 110 },
  { prop: 'price', label: '价格(元)', width: 100 },
  { prop: 'description', label: '简介', minWidth: 200 },
  { prop: 'createdAt', label: '创建时间', width: 180 }
]

const searchFields = [
  {
    prop: 'courseName',
    label: '课程名称',
    type: 'input',
    placeholder: '按课程名搜索'
  }
]

// 关键修复：将 keyword 拆分为 courseName 和 teacherName 发送给后端
const loadList = async () => {
  loading.value = true
  try {
    const res = await getCourseListService({
      page: params.value.page,
      size: params.value.size,
      courseName: params.value.courseName?.trim() || undefined,
      teacherName: params.value.teacherName?.trim() || undefined
    })
    courseList.value = res.data.records || []
    total.value = res.data.total || 0
  } catch (err) {
    ElMessage.error('加载失败')
    courseList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadList()
})

const handleSearch = () => {
  params.value.page = 1
  loadList()
}

const handleReset = () => {
  params.value.courseName = ''
  params.value.teacherName = ''
  params.value.page = 1
  loadList()
}

const handlePageChange = (page) => {
  params.value.page = page
  loadList()
}

const handleSizeChange = (size) => {
  params.value.size = size
  params.value.page = 1
  loadList()
}

const openCreate = () => {
  dialogVisible.value = true
  isEdit.value = false
  courseInfo.value = {}
}

const openEdit = (row) => {
  courseInfo.value = { ...row }
  dialogVisible.value = true
  isEdit.value = true
}

const handleDelete = async (id) => {
  await ElMessageBox.confirm('确定删除该课程？', '提示', { type: 'warning' })
  await deleteCourseService(id)
  ElMessage.success('删除成功')
  loadList()
}

const handleViewDetail = (id) => {
  // 跳转到详情页，携带 id 作为 query 参数
  router.push({ path: '/course/detail', query: { id: String(id) } })
}

const handleSubmitForm = async (formData) => {
  loading.value = true
  try {
    if (isEdit.value) {
      await updateCourseService(courseInfo.value.id, formData)
      ElMessage.success('更新成功')
    } else {
      await createCourseService(formData)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadList()
  } catch (err) {
    ElMessage.error('操作失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="course-management">
    <GenericListManager
      title="课程管理"
      :columns="columns"
      :search-fields="searchFields"
      :list="courseList"
      :total="total"
      :loading="loading"
      :pagination="params"
      :search-params="params"
      :show-view-btn="true"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      @create="openCreate"
      @edit="openEdit"
      @delete="handleDelete"
      @view-detail="handleViewDetail"
    >
      <template #col-price="{ row }">
        ¥{{ row.price != null ? Number(row.price).toFixed(2) : '—' }}
      </template>
      <template #col-createdAt="{ row }">
        {{ formatTime(row.createdAt) }}
      </template>
      <template #col-teacherName="{ row }">
        {{ row.teacherName || '—' }}
      </template>
    </GenericListManager>

    <GenericFormDrawer
      v-model="dialogVisible"
      :is-edit="isEdit"
      :initial-data="courseInfo"
      :fields="[
        { prop: 'courseName', label: '课程名称', type: 'input', required: true },
        { prop: 'description', label: '课程简介', type: 'textarea', rows: 3 },
        { prop: 'duration', label: '课时时长(分钟)', type: 'number', min: 1, step: 5 },
        { prop: 'price', label: '价格(元)', type: 'number', step: 0.01, min: 0 }
      ]"
      @submit="handleSubmitForm"
    />
  </div>
</template>

<style scoped>
.course-management {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}
</style>