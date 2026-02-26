<!-- src/views/admin/schedule-manage/BatchScheduleForm.vue -->
<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>批量排课</span>
        <el-button @click="router.back()">返回</el-button>
      </div>
    </template>

    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      v-loading="loading"
    >
      <!-- 学生 -->
      <el-form-item label="学生" prop="studentId">
        <el-select
          v-model="formData.studentId"
          placeholder="请选择学生"
          style="width: 100%"
          filterable
        >
          <el-option
            v-for="item in studentOptions"
            :key="item.id"
            :label="item.name"
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
          filterable
        >
          <el-option
            v-for="item in teacherOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <!-- 课程 -->
      <el-form-item label="课程" prop="courseId">
        <el-select
          v-model="formData.courseId"
          placeholder="请选择课程"
          style="width: 100%"
          filterable
          @change="onCourseChange"
        >
          <el-option
            v-for="item in courseOptions"
            :key="item.id"
            :label="item.courseName || item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <!-- 时长（新增） -->
      <el-form-item label="上课时长(分钟)" prop="duration">
        <el-input-number
          v-model="formData.duration"
          :min="15"
          :max="240"
          :step="15"
          controls-position="right"
          placeholder="留空则使用课程默认时长"
          style="width: 100%"
          clearable
        />
        <template #extra>范围：15 ~ 240 分钟。若不填，系统将使用该课程的默认时长。</template>
      </el-form-item>

      <!-- 琴房（可选） -->
      <el-form-item label="琴房" prop="roomId">
        <el-select
          v-model="formData.roomId"
          placeholder="可选（留空则自动分配）"
          clearable
          style="width: 100%"
          filterable
        >
          <el-option
            v-for="item in roomOptions"
            :key="item.id"
            :label="item.roomName || item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <!-- 开始时间 -->
      <el-form-item label="首节课时间" prop="startTime">
        <el-date-picker
          v-model="formData.startTime"
          type="datetime"
          placeholder="选择日期时间"
          format="YYYY-MM-DD HH:mm"
          value-format="YYYY-MM-DDTHH:mm:ss"
          style="width: 100%"
        />
      </el-form-item>

      <!-- 频率 -->
      <el-form-item label="排课频率" prop="frequency">
        <el-radio-group v-model="formData.frequency">
          <el-radio label="WEEKLY">每周一次</el-radio>
          <el-radio label="BIWEEKLY">隔周一次</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 课节数量 -->
      <el-form-item label="生成课节数" prop="count">
        <el-input-number
          v-model="formData.count"
          :min="1"
          :max="20"
          :step="1"
          controls-position="right"
          style="width: 100%"
        />
        <template #extra>范围：1 ~ 20 节，默认 4 节</template>
      </el-form-item>

      <!-- 操作按钮 -->
      <el-form-item>
        <el-button
          type="primary"
          @click="handleSubmit"
          :loading="submitting"
          :disabled="submitting"
        >
          批量创建
        </el-button>
        <el-button @click="router.back()">取消</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

import {
  getCourseListForScheduleService,
  getAvailableTeacherListService,
  getStudentListService,
  getAvailableRoomListService,
  batchCreateScheduleService
} from '@/api/admin/schedule'

const router = useRouter()
const route = useRoute()

// ====== 状态 ======
const loading = ref(false)
const submitting = ref(false)

const formData = reactive({
  studentId: null,
  teacherId: null,
  courseId: null,
  duration: null, // 👈 新增字段，初始为 null（表示不传）
  roomId: null,
  startTime: '',
  frequency: 'WEEKLY',
  count: 4
})

const studentOptions = ref([])
const teacherOptions = ref([])
const courseOptions = ref([])
const roomOptions = ref([])

// 表单规则（duration 非必填，但若填写需校验）
const rules = {
  studentId: [{ required: true, message: '请选择学生', trigger: 'change' }],
  teacherId: [{ required: true, message: '请选择教师', trigger: 'change' }],
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  frequency: [{ required: true, message: '请选择频率', trigger: 'change' }],
  count: [
    { required: true, message: '请输入数量', trigger: 'blur' },
    { type: 'number', min: 1, max: 20, message: '范围 1~20', trigger: 'blur' }
  ]
  // duration 不设 required，由提交逻辑处理
}

// ====== 课程变更时（可选优化）======
// 如果课程有默认 duration，可以自动填充（需 API 支持）
const onCourseChange = (courseId) => {
  const course = courseOptions.value.find(c => c.id === courseId)
  if (course && course.defaultDuration) {
    // 可选：自动填充课程默认时长（如果用户还没手动改过）
    // 这里简单处理：只有当 duration 为空时才填充
    if (formData.duration === null) {
      formData.duration = course.defaultDuration
    }
  }
}

// ====== 加载基础数据 ======
const loadBaseOptions = async () => {
  loading.value = true
  try {
    const futureTime = dayjs().add(1, 'hour').format('YYYY-MM-DDTHH:mm:ss')

    const [studentRes, teacherRes, courseRes, roomRes] = await Promise.all([
      getStudentListService({ startTime: futureTime, duration: 60 }),
      getAvailableTeacherListService({ startTime: futureTime, duration: 60 }),
      getCourseListForScheduleService(),
      getAvailableRoomListService({ startTime: futureTime, duration: 60 })
    ])

    studentOptions.value = studentRes.data || []
    teacherOptions.value = teacherRes.data || []
    courseOptions.value = courseRes.data || []
    roomOptions.value = roomRes.data || []
  } catch (err) {
    ElMessage.error('加载基础数据失败')
    console.error('批量排课 - 加载选项失败:', err)
  } finally {
    loading.value = false
  }
}

// ====== 提交 ======
const handleSubmit = async () => {
  if (
    !formData.studentId ||
    !formData.teacherId ||
    !formData.courseId ||
    !formData.startTime
  ) {
    ElMessage.warning('请填写完整必填信息')
    return
  }

  if (formData.count < 1 || formData.count > 20) {
    ElMessage.warning('课节数量必须在 1~20 之间')
    return
  }

  // 校验 duration（如果填写了）
  if (formData.duration !== null && formData.duration !== undefined) {
    const dur = Number(formData.duration)
    if (isNaN(dur) || dur < 15 || dur > 240) {
      ElMessage.warning('上课时长必须在 15~240 分钟之间')
      return
    }
  }

  submitting.value = true
  try {
    // 构造 payload：duration 为 null 或 undefined 时不传
    const payload = {
      studentId: formData.studentId,
      teacherId: formData.teacherId,
      courseId: formData.courseId,
      roomId: formData.roomId || undefined,
      startTime: formData.startTime,
      frequency: formData.frequency,
      count: formData.count
    }

    // 仅当用户明确输入了 duration 时才加入
    if (formData.duration != null && formData.duration !== '') {
      payload.duration = Number(formData.duration)
    }

    await batchCreateScheduleService(payload)
    ElMessage.success('批量排课成功！')
    router.push('/schedule/list')
  } catch (err) {
    const msg = err.response?.data?.message || '批量排课失败，请稍后重试'
    ElMessage.error(msg)
    console.error('批量提交失败:', err)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadBaseOptions()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>