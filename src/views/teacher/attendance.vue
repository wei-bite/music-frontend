<template>
  <GenericListManager
    title="我的考勤记录"
    :columns="columns"
    :searchFields="searchFields"
    :list="filteredData"
    :total="filteredData.length"
    :loading="loading"
    :pagination="pagination"
    :searchParams="searchParams"
    :showViewBtn="false"
    @create="handleCreate"
    @search="handleSearch"
    @reset="handleReset"
    @edit="handleEdit"
    @delete="handleDelete"
  >
    <!-- 状态列：显示中文 -->
    <template #col-status="{ row }">
      <el-tag :type="getStatusTagType(row.status)">
        {{ getStatusText(row.status) }}
      </el-tag>
    </template>

    <!-- 上课时间格式化 -->
    <template #col-lessonTime="{ row }">
      {{ formatDateTime(row.lessonTime) }}
    </template>

    <!-- 录入时间格式化 -->
    <template #col-createdAt="{ row }">
      {{ formatDateTime(row.createdAt) }}
    </template>
  </GenericListManager>

  <!-- 编辑弹窗 -->
  <el-dialog v-model="editDialogVisible" title="编辑考勤记录" width="400px" @close="resetEditForm">
    <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="80px">
      <el-form-item label="出勤状态" prop="status">
        <el-select v-model="editForm.status" placeholder="请选择状态" style="width: 100%">
          <el-option value="present" label="出勤" />
          <el-option value="absent" label="缺勤" />
          <el-option value="late" label="迟到" />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="editForm.remark" type="textarea" :rows="2" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="editDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitEdit">保存</el-button>
    </template>
  </el-dialog>

  <!-- 新增考勤弹窗 -->
  <el-dialog v-model="addDialogVisible" title="新增考勤记录" width="480px" @close="resetAddForm">
    <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="80px">
      <el-form-item label="选择课节" prop="lessonId">
        <el-select
          v-model="addForm.lessonId"
          placeholder="请选择课节"
          style="width: 100%"
          filterable
          @change="onAddLessonChange"
        >
          <el-option
            v-for="lesson in lessonOptionsForAdd"
            :key="lesson.id"
            :label="`${lesson.courseName} - ${formatDateTime(lesson.startTime)} (${lesson.studentName})`"
            :value="lesson.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="学生姓名">
        <el-input v-model="selectedStudentNameForAdd" readonly placeholder="选择课节后自动填充" />
      </el-form-item>

      <el-form-item label="出勤状态" prop="status">
        <el-radio-group v-model="addForm.status">
          <el-radio value="present">出勤</el-radio>
          <el-radio value="absent">缺勤</el-radio>
          <el-radio value="late">迟到</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input v-model="addForm.remark" type="textarea" :rows="2" placeholder="可填写迟到原因等" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="addDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitAdd">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import GenericListManager from '@/components/GenericListManager.vue'
import {
  getMyAttendanceRecordsService,
  updateAttendanceRecordService,
  deleteAttendanceRecordService,
  getTeacherCourseListService,
  addAttendanceRecordService
} from '@/api/teacher/teacher'

// ================== 公共数据 ==================
const loading = ref(false)
const rawList = ref([])
const searchParams = ref({
  courseName: '',
  studentName: '',
  status: ''
})
const pagination = ref({ page: 1, size: 10 })

// ================== 列与搜索配置 ==================
const columns = [
  { prop: 'courseName', label: '课程名称', minWidth: '140' },
  { prop: 'studentName', label: '学生姓名', minWidth: '100' },
  { prop: 'lessonTime', label: '上课时间', minWidth: '160' },
  { prop: 'status', label: '出勤状态', minWidth: '100' },
  { prop: 'remark', label: '备注', minWidth: '120' },
  { prop: 'createdAt', label: '录入时间', minWidth: '160' }
]

const searchFields = [
  { prop: 'courseName', label: '课程名称', type: 'input', placeholder: '请输入课程名' },
  { prop: 'studentName', label: '学生姓名', type: 'input', placeholder: '请输入学生名' },
  {
    prop: 'status',
    label: '出勤状态',
    type: 'select',
    options: [
      { label: '出勤', value: 'present' },
      { label: '缺勤', value: 'absent' },
      { label: '迟到', value: 'late' }
    ]
  }
]

// ================== 过滤与分页 ==================
const filteredData = computed(() => {
  let list = [...rawList.value]

  if (searchParams.value.courseName) {
    list = list.filter(item =>
      item.courseName?.toLowerCase().includes(searchParams.value.courseName.toLowerCase())
    )
  }
  if (searchParams.value.studentName) {
    list = list.filter(item =>
      item.studentName?.toLowerCase().includes(searchParams.value.studentName.toLowerCase())
    )
  }
  if (searchParams.value.status) {
    list = list.filter(item => item.status === searchParams.value.status)
  }

  const start = (pagination.value.page - 1) * pagination.value.size
  return list.slice(start, start + pagination.value.size)
})

// ================== 加载数据 ==================
const loadAttendanceList = async () => {
  loading.value = true
  try {
    const res = await getMyAttendanceRecordsService()
    if (res.code === 200) {
      rawList.value = Array.isArray(res.data) ? res.data : []
    } else {
      ElMessage.error(res.message || '加载失败')
    }
  } catch (err) {
    ElMessage.error('网络错误，请重试')
    console.error(err)
  } finally {
    loading.value = false
  }
}

// ================== 搜索与重置 ==================
const handleSearch = () => {
  pagination.value.page = 1
}
const handleReset = () => {
  searchParams.value = { courseName: '', studentName: '', status: '' }
  pagination.value.page = 1
}

// ================== 编辑功能 ==================
const editDialogVisible = ref(false)
const currentRecordId = ref(null)
const editFormRef = ref()
const editForm = ref({ status: '', remark: '' })
const editRules = {
  status: [{ required: true, message: '请选择出勤状态', trigger: 'change' }]
}

const handleEdit = (row) => {
  currentRecordId.value = row.id
  editForm.value = {
    status: row.status,
    remark: row.remark || ''
  }
  editDialogVisible.value = true
}

const submitEdit = async () => {
  await editFormRef.value.validate()
  try {
    const res = await updateAttendanceRecordService(currentRecordId.value, editForm.value)
    if (res.code === 200) {
      ElMessage.success('更新成功')
      editDialogVisible.value = false
      loadAttendanceList()
    } else {
      ElMessage.error(res.message || '更新失败')
    }
  } catch (err) {
    ElMessage.error('更新失败，请重试')
  }
}

const resetEditForm = () => {
  editFormRef.value?.resetFields()
}

// ================== 删除功能 ==================
const handleDelete = (id) => {
  ElMessageBox.confirm('确定要删除这条考勤记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteAttendanceRecordService(id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        loadAttendanceList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (err) {
      ElMessage.error('删除失败，请重试')
    }
  })
}

// ================== 新增功能 ==================
const addDialogVisible = ref(false)
const addFormRef = ref()
const addForm = ref({
  lessonId: null,
  studentId: null,
  status: 'present',
  remark: ''
})
const addRules = {
  lessonId: [{ required: true, message: '请选择课节', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}
const lessonOptionsForAdd = ref([])
const selectedStudentNameForAdd = ref('')

const loadLessonsForAdd = async () => {
  try {
    const res = await getTeacherCourseListService()
    if (res.code === 200) {
      const now = new Date()
      lessonOptionsForAdd.value = (Array.isArray(res.data) ? res.data : [])
        .filter(lesson => new Date(lesson.startTime) > now)
        .map(lesson => ({
          ...lesson,
          studentId: lesson.studentId,
          studentName: lesson.studentName || '未知学生'
        }))
    }
  } catch (err) {
    ElMessage.error('加载课节失败')
  }
}

const onAddLessonChange = (lessonId) => {
  const lesson = lessonOptionsForAdd.value.find(l => l.id === lessonId)
  if (lesson) {
    addForm.value.studentId = lesson.studentId
    selectedStudentNameForAdd.value = lesson.studentName
  } else {
    addForm.value.studentId = null
    selectedStudentNameForAdd.value = ''
  }
}

const handleCreate = () => {
  addForm.value = { lessonId: null, studentId: null, status: 'present', remark: '' }
  selectedStudentNameForAdd.value = ''
  addDialogVisible.value = true
  loadLessonsForAdd()
}

const submitAdd = async () => {
  await addFormRef.value.validate()
  if (!addForm.value.studentId) {
    ElMessage.warning('请选择有效课节')
    return
  }
  try {
    const res = await addAttendanceRecordService({
      lessonId: addForm.value.lessonId,
      studentId: addForm.value.studentId,
      status: addForm.value.status,
      remark: addForm.value.remark
    })
    if (res.code === 200) {
      ElMessage.success('考勤记录添加成功')
      addDialogVisible.value = false
      loadAttendanceList()
    } else {
      ElMessage.error(res.message || '添加失败')
    }
  } catch (err) {
    ElMessage.error('添加失败，请重试')
  }
}

const resetAddForm = () => {
  addFormRef.value?.resetFields()
}

// ================== 工具函数 ==================
const getStatusText = (status) => {
  const map = { present: '出勤', absent: '缺勤', late: '迟到' }
  return map[status] || status
}

const getStatusTagType = (status) => {
  const map = { present: 'success', absent: 'danger', late: 'warning' }
  return map[status] || ''
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

// ================== 初始化 ==================
onMounted(() => {
  loadAttendanceList()
})
</script>

<style scoped>
:deep(.el-tag) {
  margin-right: 0;
}
</style>