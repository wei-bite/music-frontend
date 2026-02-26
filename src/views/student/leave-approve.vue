<template>
  <div class="leave-apply-container">
    <el-card shadow="never" style="border-radius: 8px; border: 1px solid #e4e7ed;">
      <template #header>
        <div class="card-header">
          <span>请假申请</span>
        </div>
      </template>

      <!--申请表单 -->
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="apply-form">
        <el-form-item label="请假类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择请假类型" style="width: 200px">
            <el-option label="病假" value="sick" />
            <el-option label="事假" value="personal" />
          </el-select>
        </el-form-item>
        <el-form-item label="请假时间" prop="dateRange">
          <el-date-picker
            v-model="form.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="请假原因" prop="reason">
          <el-input
            v-model="form.reason"
            type="textarea"
            :rows="3"
            placeholder="请详细描述请假原因"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">提交申请</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!--我的请假记录 -->
    <el-card shadow="never" style="border-radius: 8px; border: 1px solid #e4e7ed; margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>我的请假记录</span>
        </div>
      </template>

      <el-table :data="leaveList" style="width: 100%" v-loading="loading" border>
        <el-table-column prop="type" label="请假类型" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getLeaveTypeTag(row.type)" size="small">
              {{ getLeaveTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="请假时间" min-width="180" align="center">
          <template #default="{ row }">
            {{ formatDateTime(row.startTime) }} ~ {{ formatDateTime(row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="请假原因" min-width="200" align="center" show-overflow-tooltip />
        <el-table-column prop="status" label="审批状态" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="申请时间" min-width="160" align="center">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="150" align="center">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              size="small" 
              :disabled="row.status !== 'pending'"
              @click="handleOpenEditDialog(row)"
            >
              修改
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              :disabled="row.status !== 'pending'"
              @click="handleCancel(row)"
            >
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && leaveList.length === 0" description="暂无请假记录" />
    </el-card>

    <!-- 修改请假对话框 -->
    <el-dialog v-model="editDialog.visible" title="修改请假申请" width="600px" :close-on-click-modal="false">
      <el-form :model="editDialog.form" :rules="editDialog.rules" ref="editFormRef" label-width="100px">
        <el-form-item label="请假类型" prop="type">
          <el-select v-model="editDialog.form.type" placeholder="请选择请假类型" style="width: 100%">
            <el-option label="病假" value="sick" />
            <el-option label="事假" value="personal" />
          </el-select>
        </el-form-item>
        <el-form-item label="请假时间" prop="dateRange">
          <el-date-picker
            v-model="editDialog.form.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DDTHH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="请假原因" prop="reason">
          <el-input
            v-model="editDialog.form.reason"
            type="textarea"
            :rows="3"
            placeholder="请详细描述请假原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCloseEditDialog">取消</el-button>
          <el-button type="primary" @click="handleUpdate" :loading="editDialog.submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { applyLeaveService, getMyLeaveRecordsService, updateLeaveService, cancelLeaveService } from '@/api/student/student'

const formRef = ref()
const editFormRef = ref()
const form = ref({
  type: '',
  dateRange: [],
  reason: ''
})

const rules = {
  type: [{ required: true, message: '请选择请假类型', trigger: 'change' }],
  dateRange: [{ required: true, message: '请选择请假时间', trigger: 'change' }],
  reason: [{ required: true, message: '请输入请假原因', trigger: 'blur' }]
}

const submitting = ref(false)
const loading = ref(false)
const leaveList = ref([])

// 修改请假对话框
const editDialog = ref({
  visible: false,
  submitting: false,
  currentRow: null,
  form: {
    type: '',
    dateRange: [],
    reason: ''
  },
  rules: {
    type: [{ required: true, message: '请选择请假类型', trigger: 'change' }],
    dateRange: [{ required: true, message: '请选择请假时间', trigger: 'change' }],
    reason: [{ required: true, message: '请输入请假原因', trigger: 'blur' }]
  }
})

const handleSubmit = async () => {
  console.log('提交表单，当前编辑ID:', editDialog.value.currentRow?.id)
  console.log('表单数据:', form.value)
  
  await formRef.value?.validate()
  submitting.value = true
  try {
    const data = {
      type: form.value.type,
      startTime: form.value.dateRange[0],
      endTime: form.value.dateRange[1],
      reason: form.value.reason
    }
    
    console.log('提交请假数据:', data)
    console.log('开始时间格式:', typeof data.startTime, data.startTime)
    console.log('结束时间格式:', typeof data.endTime, data.endTime)
    
    let res
    if (editDialog.value.currentRow?.id) {
      // 修改请假申请
      console.log('执行修改操作，ID:', editDialog.value.currentRow.id)
      res = await updateLeaveService(editDialog.value.currentRow.id, data)
    } else {
      // 新增请假申请
      console.log('执行新增操作')
      res = await applyLeaveService(data)
    }
    
    console.log('API响应:', res)
    
    if (res.code === 200) {
      ElMessage.success(editDialog.value.currentRow?.id ? '请假申请已修改' : '申请提交成功')
      handleReset()
      loadLeaveList()
    } else {
      ElMessage.error(res.message || (editDialog.value.currentRow?.id ? '修改失败' : '提交失败'))
    }
  } catch (err) {
    console.error('提交请假错误:', err)
    ElMessage.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

const handleReset = () => {
  form.value = {
    type: '',
    dateRange: [],
    reason: ''
  }
  formRef.value?.resetFields()
}

const handleOpenEditDialog = (row) => {
  console.log('点击修改按钮，行数据:', row)
  if (row.status !== 'pending') {
    ElMessage.warning('只能修改待审批状态的请假申请')
    return
  }
  
  console.log('准备打开编辑对话框，ID:', row.id)
  editDialog.value.currentRow = row
  editDialog.value.form = {
    type: row.type,
    dateRange: [row.startTime, row.endTime],
    reason: row.reason
  }
  editDialog.value.visible = true
  console.log('对话框已打开，表单数据:', editDialog.value.form)
}

const handleCloseEditDialog = () => {
  editDialog.value.visible = false
  editDialog.value.currentRow = null
  editFormRef.value?.resetFields()
  editDialog.value.form = {
    type: '',
    dateRange: [],
    reason: ''
  }
}

const handleUpdate = async () => {
  console.log('点击更新按钮，当前编辑行:', editDialog.value.currentRow)
  
  await editFormRef.value?.validate()
  editDialog.value.submitting = true
  try {
    const data = {
      type: editDialog.value.form.type,
      startTime: editDialog.value.form.dateRange[0],
      endTime: editDialog.value.form.dateRange[1],
      reason: editDialog.value.form.reason
    }
    
    console.log('更新请假数据:', data)
    const res = await updateLeaveService(editDialog.value.currentRow.id, data)
    console.log('更新API响应:', res)
    
    if (res.code === 200) {
      ElMessage.success('请假申请已修改')
      handleCloseEditDialog()
      loadLeaveList()
    } else {
      ElMessage.error(res.message || '修改失败')
    }
  } catch (err) {
    console.error('更新请假错误:', err)
    ElMessage.error('修改失败，请重试')
  } finally {
    editDialog.value.submitting = false
  }
}

const handleCancel = async (row) => {
  console.log('点击取消按钮，行数据:', row)
  if (row.status !== 'pending') {
    ElMessage.warning('只能取消待审批状态的请假申请')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      '确定要取消这个请假申请吗？',
      '确认取消',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    console.log('准备取消请假申请，ID:', row.id)
    const res = await cancelLeaveService(row.id)
    console.log('取消请假API响应:', res)
    
    if (res.code === 200) {
      ElMessage.success(res.message || '请假申请已删除')
      console.log('开始重新加载列表...')
      await loadLeaveList()  // 确保等待列表加载完成
      console.log('列表已重新加载')
    } else {
      ElMessage.error(res.message || '取消失败')
    }
  } catch (error) {
    console.error('取消请假错误:', error)
    if (error !== 'cancel') {
      ElMessage.error('取消失败')
    }
  }
}

const loadLeaveList = async () => {
  loading.value = true
  try {
    const res = await getMyLeaveRecordsService()
    console.log('获取请假记录API响应:', res)
    
    if (res.code === 200) {
      const records = Array.isArray(res.data) ? res.data : (res.data?.records || [])
      console.log('请假记录数据:', records)
      leaveList.value = records
    } else {
      ElMessage.error(res.message || '加载失败')
    }
  } catch (err) {
    console.error('加载请假记录错误:', err)
    ElMessage.error('网络错误，请重试')
  } finally {
    loading.value = false
  }
}

const getLeaveTypeText = (type) => {
  const map = { sick: '病假', personal: '事假' }
  return map[type] || type
}

const getLeaveTypeTag = (type) => {
  const map = { sick: 'danger', personal: 'warning' }
  return map[type] || 'info'
}

const getStatusText = (status) => {
  const map = { 
    pending: '待审批', 
    approved: '已批准', 
    rejected: '已拒绝',
    cancelled: '已取消'
  }
  return map[status] || status
}

const getStatusTag = (status) => {
  const map = { 
    pending: 'warning', 
    approved: 'success', 
    rejected: 'danger',
    cancelled: 'info'
  }
  return map[status] || 'info'
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

onMounted(() => {
  loadLeaveList()
})
</script>

<style scoped lang="scss">
.leave-apply-container {
  padding: 20px;
  background-color: #f5f7fa;

  .card-header {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }

  .apply-form {
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