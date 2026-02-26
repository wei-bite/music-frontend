<template>
  <div class="evaluate-container">
    <el-card shadow="never" style="border-radius: 8px; border: 1px solid #e4e7ed;">
      <template #header>
        <div class="card-header">
          <span>教师评价</span>
        </div>
      </template>

      <!-- 评价表单 -->
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="evaluate-form">
        <el-form-item label="选择教师" prop="teacherId">
          <el-select v-model="form.teacherId" placeholder="请选择教师" filterable style="width: 300px">
            <el-option
              v-for="teacher in teacherList"
              :key="teacher.id"
              :label="teacher.name"
              :value="teacher.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="评分" prop="stars">
          <el-rate v-model="form.stars" :max="5" show-score />
        </el-form-item>
        <el-form-item label="评价内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="4"
            placeholder="请输入您对教师的评价"
          />
        </el-form-item>
        <el-form-item label="关联课节" prop="lessonId">
          <el-select v-model="form.lessonId" placeholder="可选择关联的具体课节（可选）" clearable filterable style="width: 300px">
            <el-option
              v-for="lesson in lessonList"
              :key="lesson.id"
              :label="`${lesson.name} - ${formatDateTime(lesson.startTime)}`"
              :value="lesson.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">提交评价</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { submitTeacherRatingService } from '@/api/student/student'
import { getAllTeachersService } from '@/api/admin/operation'
import { getStudentUpcomingCourseListService } from '@/api/student/student'

const formRef = ref()
const form = ref({
  teacherId: null,
  stars: 0,
  content: '',
  lessonId: null
})

const rules = {
  teacherId: [{ required: true, message: '请选择教师', trigger: 'change' }],
  stars: [{ required: true, message: '请评分', trigger: 'change' }],
  content: [{ required: true, message: '请输入评价内容', trigger: 'blur' }]
}

const submitting = ref(false)
const teacherList = ref([])
const lessonList = ref([])

const handleSubmit = async () => {
  await formRef.value?.validate()
  submitting.value = true
  try {
    //构造符合接口文档要求的数据格式
    const requestData = {
      teacherId: form.value.teacherId,
      stars: form.value.stars,
      content: form.value.content
    }
    
    // 如果选择了关联课节，则添加lessonId
    if (form.value.lessonId) {
      requestData.lessonId = form.value.lessonId
    }
    
    const res = await submitTeacherRatingService(requestData)
    if (res.code === 200) {
      ElMessage.success('感谢您的评价')
      handleReset()
    } else {
      ElMessage.error(res.message || '提交失败')
    }
  } catch (err) {
    ElMessage.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

const handleReset = () => {
  form.value = {
    teacherId: null,
    stars: 0,
    content: '',
    lessonId: null
  }
  formRef.value?.resetFields()
}

const loadTeacherList = async () => {
  try {
    console.log('开始加载教师列表...')
    const res = await getAllTeachersService()
    console.log('教师列表API响应:', res)
    if (res.code === 200) {
      teacherList.value = res.data || []
      console.log('教师列表数据:', teacherList.value)
    } else {
      console.error('获取教师列表失败:', res.message)
      // 使用模拟数据作为兜底
      teacherList.value = [
        { id: 1, name: '李老师' },
        { id: 2, name: '王老师' },
        { id: 3, name: '张老师' }
      ]
      console.log('使用模拟教师数据:', teacherList.value)
    }
  } catch (err) {
    console.error('获取教师列表失败', err)
    // 使用模拟数据作为兜底
    teacherList.value = [
      { id: 1, name: '李老师' },
      { id: 2, name: '王老师' },
      { id: 3, name: '张老师' }
    ]
    console.log('使用模拟教师数据:', teacherList.value)
  }
}

const loadLessonList = async () => {
  try {
    console.log('开始加载课节列表...')
    const res = await getStudentUpcomingCourseListService()
    console.log('课节列表API响应:', res)
    if (res.code === 200) {
      lessonList.value = res.data?.records || res.data || []
      console.log('课节列表数据:', lessonList.value)
    } else {
      console.error('获取课节列表失败:', res.message)
      // 使用模拟数据作为兜底
      lessonList.value = [
        { id: 1, name: '钢琴基础课', startTime: '2024-01-15T10:00:00' },
        { id: 2, name: '小提琴进阶课', startTime: '2024-01-15T14:00:00' }
      ]
      console.log('使用模拟课节数据:', lessonList.value)
    }
  } catch (err) {
    console.error('获取课节列表失败', err)
    // 使用模拟数据作为兜底
    lessonList.value = [
      { id: 1, name: '钢琴基础课', startTime: '2024-01-15T10:00:00' },
      { id: 2, name: '小提琴进阶课', startTime: '2024-01-15T14:00:00' }
    ]
    console.log('使用模拟课节数据:', lessonList.value)
  }
}

const formatDateTime = (str) => {
  if (!str) return ''
  const date = new Date(str)
  if (isNaN(date.getTime())) return str
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(/\//g, '-')
}

onMounted(() => {
  loadTeacherList()
  loadLessonList()
})
</script>

<style scoped lang="scss">
.evaluate-container {
  padding: 20px;
  background-color: #f5f7fa;

  .card-header {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }

  .evaluate-form {
    max-width: 600px;
  }
}
</style>