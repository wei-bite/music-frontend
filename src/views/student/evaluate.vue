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

const formRef = ref()
const form = ref({
  teacherId: null,
  stars: 0,
  content: ''
})

const rules = {
  teacherId: [{ required: true, message: '请选择教师', trigger: 'change' }],
  stars: [{ required: true, message: '请评分', trigger: 'change' }],
  content: [{ required: true, message: '请输入评价内容', trigger: 'blur' }]
}

const submitting = ref(false)
const teacherList = ref([])

const handleSubmit = async () => {
  await formRef.value?.validate()
  submitting.value = true
  try {
    // 构造符合接口文档要求的数据格式（不包含lessonId）
    const requestData = {
      teacherId: form.value.teacherId,
      stars: form.value.stars,
      content: form.value.content
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
    content: ''
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

onMounted(() => {
  loadTeacherList()
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