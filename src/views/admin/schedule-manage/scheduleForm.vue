<!-- src/views/admin/schedule-manage/scheduleForm.vue -->
<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>{{ isEditMode ? '编辑排课' : '新增排课' }}</span>
        <el-button @click="router.back()">返回</el-button>
      </div>
    </template>

    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      v-loading="loading"
    >
      <!-- 开始时间（放最前） -->
      <el-form-item label="开始时间" prop="startTime">
        <el-date-picker
          v-model="formData.startTime"
          type="datetime"
          placeholder="选择日期时间"
          format="YYYY-MM-DD HH:mm"
          value-format="YYYY-MM-DDTHH:mm:ss"
          style="width: 100%"
        />
      </el-form-item>

      <!-- 时长（放第二） -->
      <el-form-item label="时长(分钟)" prop="duration">
        <el-input-number v-model="formData.duration" :min="30" :max="180" :step="30" />
      </el-form-item>

      <!-- 课程 -->
      <el-form-item label="课程" prop="courseId">
        <el-select v-model="formData.courseId" placeholder="请选择课程" style="width: 100%">
          <el-option
            v-for="item in courseOptions"
            :key="item.id"
            :label="item.courseName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <!-- 教师 -->
      <el-form-item label="教师" prop="teacherId">
        <el-select
          v-model="formData.teacherId"
          placeholder="请选择教师"
          style="width: 100%"
          @change="onTeacherChange"
        >
          <el-option
            v-for="item in teacherOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <!-- 学生 -->
      <el-form-item label="学生" prop="studentId">
        <el-select v-model="formData.studentId" placeholder="请选择学生" style="width: 100%">
          <el-option
            v-for="item in studentOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <!-- 琴房（依赖教师+时间） -->
      <el-form-item label="琴房" prop="roomId">
        <el-select
          v-model="formData.roomId"
          placeholder="请先选择教师和时间"
          :disabled="!canLoadRooms"
          style="width: 100%"
        >
          <el-option
            v-for="item in roomOptions"
            :key="item.id"
            :label="item.roomName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ isEditMode ? '更新' : '创建' }}
        </el-button>
        <el-button @click="router.back()">取消</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

// API
import {
  getCourseListForScheduleService,
  getAvailableTeacherListService,
  getStudentListService,
  getAvailableRoomListService,
  createScheduleService,
  updateScheduleService,
  getScheduleDetailService
} from '@/api/admin/schedule'

const route = useRoute()
const router = useRouter()

// ====== 模式判断 ======
const isEditMode = computed(() => route.query.mode === 'edit')
const editingId = computed(() => route.query.id)

// ====== 状态 ======
const loading = ref(false)
const submitting = ref(false)
const formData = reactive({
  courseId: null,
  teacherId: null,
  studentId: null,
  startTime: '',
  duration: 60,
  roomId: null
})

// 选项
const courseOptions = ref([])
const teacherOptions = ref([])
const studentOptions = ref([])
const roomOptions = ref([])

// 表单规则
const rules = {
  courseId: [{ required: true, message: '请选择课程' }],
  teacherId: [{ required: true, message: '请选择教师' }],
  studentId: [{ required: true, message: '请选择学生' }],
  startTime: [{ required: true, message: '请选择开始时间' }],
  duration: [{ required: true, message: '请输入时长' }],
  roomId: [{ required: true, message: '请选择琴房' }]
}

// 是否可以加载琴房
const canLoadRooms = computed(() => {
  return formData.teacherId && formData.startTime
})

// ====== 加载基础选项 ======
const loadBaseOptions = async () => {
  try {
    const futureTime = dayjs().add(1, 'year').format('YYYY-MM-DDTHH:mm:ss')

    // 课程
    const courseRes = await getCourseListForScheduleService()
    courseOptions.value = courseRes.data || []

    // 教师
    const teacherRes = await getAvailableTeacherListService({
      startTime: futureTime,
      duration: 60
    })
    teacherOptions.value = teacherRes.data || []

    // 学生
    const studentRes = await getStudentListService({
      startTime: futureTime,
      duration: 60
    })
    studentOptions.value = studentRes.data || []
  } catch (err) {
    ElMessage.error('加载基础数据失败')
    console.error('加载基础数据失败:', err)
  }
}

// ====== 加载琴房 ======
const loadRooms = async () => {
  if (!canLoadRooms.value) return
  try {
    const res = await getAvailableRoomListService({
      teacherId: formData.teacherId,
      startTime: formData.startTime,
      duration: formData.duration
    })
    roomOptions.value = res.data || []
  } catch (err) {
    roomOptions.value = []
    ElMessage.warning('当前时段无可用琴房')
  }
}

// ====== 教师变更 ======
const onTeacherChange = () => {
  formData.roomId = null
  roomOptions.value = []
  if (canLoadRooms.value) {
    loadRooms()
  }
}

// ====== 监听时间变化 ======
watch(
  () => [formData.startTime, formData.duration],
  () => {
    if (canLoadRooms.value) {
      loadRooms()
    } else {
      roomOptions.value = []
    }
  }
)

// ====== 编辑模式加载详情 ======
const loadDetail = async () => {
  if (!isEditMode.value) return
  loading.value = true
  try {
    const res = await getScheduleDetailService(editingId.value)
    const data = res.data

    Object.assign(formData, {
      courseId: data.courseId,
      teacherId: data.teacherId,
      studentId: data.studentId,
      startTime: data.startTime,
      duration: data.duration,
      roomId: data.roomId
    })

    await loadRooms()
  } catch (err) {
    ElMessage.error('加载排课详情失败')
    console.error('加载详情失败:', err)
  } finally {
    loading.value = false
  }
}

// ====== 提交 ======
const handleSubmit = async () => {
  if (
    !formData.courseId ||
    !formData.teacherId ||
    !formData.studentId ||
    !formData.startTime ||
    !formData.duration ||
    !formData.roomId
  ) {
    ElMessage.warning('请填写完整信息')
    return
  }

  const selectedStudent = studentOptions.value.find(s => s.id === formData.studentId)
  if (!selectedStudent) {
    ElMessage.error('请选择有效学生')
    return
  }

  submitting.value = true
  try {
    if (isEditMode.value) {
      await updateScheduleService(editingId.value, {
        ...formData,
        startTime: formData.startTime
      })
    } else {
      // ✅ 修复拼写错误：createScheduleServe → createScheduleService
      await createScheduleService({
        ...formData,
        startTime: formData.startTime
      })
    }

    ElMessage.success(isEditMode.value ? '更新成功' : '创建成功')
    // ✅ 使用路径跳转，确保能触发 watch
    router.push('/schedule/list')
  } catch (err) {
    const msg = err.response?.data?.message || '操作失败'
    ElMessage.error(msg)
    console.error('提交失败:', err)
  } finally {
    submitting.value = false
  }
}

// ====== 初始化 ======
onMounted(() => {
  loadBaseOptions()
  if (isEditMode.value) {
    loadDetail()
  }
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>