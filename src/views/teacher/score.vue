<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  submitExamScoreService, 
  getExamHistoryService, 
  getExamHistoryByStudentService,
  getExamDetailService,
  updateExamService,
  deleteExamService,
  getMyStudentsService 
} from '@/api/teacher/teacher'

const formRef = ref()
const editFormRef = ref()
const form = ref({
  studentId: null,
  examName: '',
  score: 0,
  examDate: '',
  comment: ''
})

const rules = {
  studentId: [{ required: true, message: '请选择学生', trigger: 'change' }],
  examName: [{ required: true, message: '请输入考试名称', trigger: 'blur' }],
  score: [{ required: true, message: '请输入分数', trigger: 'blur' }]
}

const submitting = ref(false)
const loading = ref(false)
const studentList = ref([])
const examList = ref([])
const searchStudentId = ref(null)
const isUsingMockData = ref(false) // 添加标记是否使用模拟数据

//编辑对话框
const editDialog = ref({
  visible: false,
  isEdit: false,
  submitting: false,
  form: {
    id: null,
    studentName: '',
    examName: '',
    score: 0,
    examDate: '',
    comment: ''
  },
  rules: {
    examName: [{ required: true, message: '请输入考试名称', trigger: 'blur' }],
    score: [{ required: true, message: '请输入分数', trigger: 'blur' }]
  }
})

const handleSubmit = async () => {
  await formRef.value?.validate()
  submitting.value = true
  try {
    const data = { ...form.value }
    if (!data.examDate) {
      data.examDate = new Date().toISOString().split('T')[0]
    }
    const res = await submitExamScoreService(data)
    if (res.code === 200) {
      ElMessage.success('成绩提交成功')
      handleReset()
      loadExamHistory()
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
    studentId: null,
    examName: '',
    score: 0,
    examDate: '',
    comment: ''
  }
  formRef.value?.resetFields()
}

const loadStudentList = async () => {
  try {
    //首尝试使用教师端的API
    const res = await getMyStudentsService()
    if (res.code === 200) {
      studentList.value = res.data?.records || res.data || []
      isUsingMockData.value = false
      return // 成功则返回
    } else {
      console.info('教师端API失败，使用模拟数据:', res.message)
    }
  } catch (err) {
    console.info('教师端API不可用，使用模拟数据:', err)
  }
  
  // 使用模拟数据作为兜底
  studentList.value = [
    { id: 1, name: '张三' },
    { id: 2, name: '李四' },
    { id: 3, name: '王五' }
  ]
  isUsingMockData.value = true
  ElMessage.info('当前使用演示数据，后端接口暂不可用')
}

const loadExamHistory = async () => {
  loading.value = true
  try {
    let res
    if (searchStudentId.value) {
      //按学生筛选
      res = await getExamHistoryByStudentService(searchStudentId.value)
    } else {
      //获取所有历记录
      res = await getExamHistoryService()
    }
    
    if (res.code === 200) {
      examList.value = Array.isArray(res.data) ? res.data : (res.data?.records || [])
    } else {
      ElMessage.error(res.message || '加载失败')
    }
  } catch (err) {
    ElMessage.error('网络错误，请重试')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  loadExamHistory()
}

const handleEdit = async (row) => {
  try {
    const res = await getExamDetailService(row.id)
    if (res.code === 200) {
      const data = res.data
      editDialog.value.form = {
        id: data.id,
        studentName: data.studentName || row.studentName,
        examName: data.examName,
        score: data.score,
        examDate: data.examDate,
        comment: data.comment
      }
      editDialog.value.isEdit = true
      editDialog.value.visible = true
    } else {
      ElMessage.error(res.message || '获取详情失败')
    }
  } catch (err) {
    ElMessage.error('获取详情失败')
  }
}

const handleUpdate = async () => {
  await editFormRef.value?.validate()
  editDialog.value.submitting = true
  try {
    const data = {
      examName: editDialog.value.form.examName,
      score: editDialog.value.form.score,
      examDate: editDialog.value.form.examDate,
      comment: editDialog.value.form.comment
    }
    
    const res = await updateExamService(editDialog.value.form.id, data)
    if (res.code === 200) {
      ElMessage.success('更新成功')
      editDialog.value.visible = false
      loadExamHistory()
    } else {
      ElMessage.error(res.message || '更新失败')
    }
  } catch (err) {
    ElMessage.error('更新失败')
  } finally {
    editDialog.value.submitting = false
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 "${row.examName}" 的考试记录吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const res = await deleteExamService(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadExamHistory()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const getScoreTag = (score) => {
  if (score >= 90) return 'success'
  if (score >= 60) return 'warning'
  return 'danger'
}

onMounted(() => {
  loadStudentList()
  loadExamHistory()
})
</script>

<template>
  <div class="score-container">
    <!--模式提示 -->
    <el-alert
      v-if="isUsingMockData"
      title="演示模式"
      type="info"
      description="当前使用演示数据，后端接口暂不可用。所有功能在演示模式下均可正常使用。"
      show-icon
      closable
      style="margin-bottom: 20px;"
    />
    
    <el-card shadow="never" style="border-radius: 8px; border: 1px solid #e4e7ed;">
      <template #header>
        <div class="card-header">
          <span>成绩打分</span>
        </div>
      </template>

      <!--打分表单 -->
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="score-form">
        <el-form-item label="选择学生" prop="studentId">
          <el-select v-model="form.studentId" placeholder="请选择学生" filterable style="width: 300px">
            <el-option
              v-for="student in studentList"
              :key="student.id"
              :label="student.name"
              :value="student.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="考试名称" prop="examName">
          <el-input v-model="form.examName" placeholder="请输入考试名称" style="width: 300px" />
        </el-form-item>
        <el-form-item label="分数" prop="score">
          <el-input-number v-model="form.score" :min="0" :max="100" :precision="1" />
        </el-form-item>
        <el-form-item label="考试日期" prop="examDate">
          <el-date-picker
            v-model="form.examDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="评语" prop="comment">
          <el-input
            v-model="form.comment"
            type="textarea"
            :rows="3"
            placeholder="请输入评语（可选）"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">提交成绩</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!--历记录 -->
    <el-card shadow="never" style="border-radius: 8px; border: 1px solid #e4e7ed; margin-top: 20px;">
      <template #header>
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
          <span>历史打分记录</span>
          <div>
            <el-select v-model="searchStudentId" placeholder="按学生筛选" clearable style="width: 150px; margin-right: 10px;" @change="handleSearch">
              <el-option
                v-for="student in studentList"
                :key="student.id"
                :label="student.name"
                :value="student.id"
              />
            </el-select>
            <el-button @click="loadExamHistory">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table :data="examList" style="width: 100%" v-loading="loading" border>
        <el-table-column prop="studentName" label="学生姓名" min-width="100" align="center" />
        <el-table-column prop="examName" label="考试名称" min-width="150" align="center" />
        <el-table-column prop="score" label="分数" min-width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="getScoreTag(row.score)" size="small">{{ row.score }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="comment" label="评语" min-width="200" align="center" show-overflow-tooltip />
        <el-table-column prop="examDate" label="考试日期" min-width="120" align="center" />
        <el-table-column label="操作" min-width="150" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && examList.length === 0" description="暂无记录" />
    </el-card>

    <!--编辑对话框 -->
    <el-dialog v-model="editDialog.visible" :title="editDialog.isEdit ? '编辑考试记录' : '查看考试记录'" width="500px">
      <el-form :model="editDialog.form" :rules="editDialog.rules" ref="editFormRef" label-width="100px">
        <el-form-item label="学生姓名">
          <el-input v-model="editDialog.form.studentName" disabled />
        </el-form-item>
        <el-form-item label="考试名称" prop="examName">
          <el-input v-model="editDialog.form.examName" />
        </el-form-item>
        <el-form-item label="分数" prop="score">
          <el-input-number v-model="editDialog.form.score" :min="0" :max="100" :precision="1" />
        </el-form-item>
        <el-form-item label="考试日期" prop="examDate">
          <el-date-picker
            v-model="editDialog.form.examDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="评语" prop="comment">
          <el-input
            v-model="editDialog.form.comment"
            type="textarea"
            :rows="3"
            placeholder="请输入评语"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleUpdate" :loading="editDialog.submitting">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.score-container {
  padding: 20px;
  background-color: #f5f7fa;

  .card-header {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }

  .score-form {
    max-width: 600px;
  }

  .el-table {
    :deep(.el-table__cell) {
      padding: 12px 16px;
    }

    :deep(.el-table__header-wrapper th) {
      background-color: #f9f9f9;
      font-weight: 500;
      color: #666;
    }
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}
</style>
