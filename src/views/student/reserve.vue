<template>
  <div class="reserve-container">
    <el-card shadow="never" style="border-radius: 8px; border: 1px solid #e4e7ed;">
      <template #header>
        <div class="card-header">
          <span>琴房预约</span>
        </div>
      </template>

      <!--预约表单 -->
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="reserve-form">
        <el-form-item label="预约时间" prop="dateRange">
          <el-date-picker
            v-model="form.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="用途说明" prop="purpose">
          <el-input
            v-model="form.purpose"
            type="textarea"
            :rows="3"
            placeholder="请说明预约用途（可选）"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">提交预约</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!--我的预约 -->
    <el-card shadow="never" style="border-radius: 8px; border: 1px solid #e4e7ed; margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>我的预约</span>
        </div>
      </template>

      <el-table :data="reservationList" style="width: 100%" v-loading="loading" border>
        <el-table-column prop="roomName" label="琴房" min-width="120" align="center" />
        <el-table-column label="预约时间" min-width="180" align="center">
          <template #default="{ row }">
            {{ formatDateTime(row.startTime) }} ~ {{ formatTime(row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="purpose" label="用途" min-width="150" align="center" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="150" align="center">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              size="small" 
              :disabled="row.status !== 'pending'"
              @click="handleEdit(row)"
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

      <el-empty v-if="!loading && reservationList.length === 0" description="暂无预约记录" />
    </el-card>

    <!-- 修改预约对话框 -->
    <el-dialog v-model="editDialog.visible" title="修改预约信息" width="500px">
      <el-form :model="editDialog.form" :rules="editDialog.rules" ref="editFormRef" label-width="100px">
        <el-form-item label="预约时间" prop="dateRange">
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
        <el-form-item label="用途说明" prop="purpose">
          <el-input
            v-model="editDialog.form.purpose"
            type="textarea"
            :rows="3"
            placeholder="请说明预约用途"
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

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import { applyPracticeRoomService, getMyReservationsService } from '@/api/common'

// 修改预约相关的API调用（根据接口文档）
const updateReservationService = (id, data) => {
  return request.put(`/api/user/reservations/${id}`, data)
}

const cancelReservationService = (id) => {
  return request.delete(`/api/user/reservations/${id}`)
}

const formRef = ref()
const editFormRef = ref()
const form = ref({
  dateRange: [],
  purpose: ''
})

const rules = {
  dateRange: [{ required: true, message: '请选择预约时间', trigger: 'change' }]
}

const submitting = ref(false)
const loading = ref(false)
const reservationList = ref([])

// 修改对话框
const editDialog = ref({
  visible: false,
  submitting: false,
  id: null,
  form: {
    dateRange: [],
    purpose: ''
  },
  rules: {
    dateRange: [{ required: true, message: '请选择预约时间', trigger: 'change' }]
  }
})

const handleSubmit = async () => {
  await formRef.value?.validate()
  submitting.value = true
  try {
    const data = {
      startTime: form.value.dateRange[0],
      endTime: form.value.dateRange[1],
      purpose: form.value.purpose
    }
    
    console.log('提交预约数据:', data)
    console.log('开始时间格式:', typeof data.startTime, data.startTime)
    console.log('结束时间格式:', typeof data.endTime, data.endTime)
    
    const res = await applyPracticeRoomService(data)
    console.log('API响应:', res)
    
    if (res.code === 200) {
      ElMessage.success('预约申请已提交')
      handleReset()
      loadReservationList()
    } else {
      ElMessage.error(res.message || '提交失败')
    }
  } catch (err) {
    console.error('提交预约错误:', err)
    ElMessage.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

const handleReset = () => {
  form.value = {
    dateRange: [],
    purpose: ''
  }
  formRef.value?.resetFields()
}

const handleEdit = (row) => {
  if (row.status !== 'pending') {
    ElMessage.warning('只能修改待审批状态的预约')
    return
  }
  
  editDialog.value.id = row.id
  editDialog.value.form = {
    dateRange: [row.startTime, row.endTime],
    purpose: row.purpose
  }
  editDialog.value.visible = true
}

const handleUpdate = async () => {
  await editFormRef.value?.validate()
  editDialog.value.submitting = true
  try {
    const data = {
      startTime: editDialog.value.form.dateRange[0],
      endTime: editDialog.value.form.dateRange[1],
      purpose: editDialog.value.form.purpose
    }
    const res = await updateReservationService(editDialog.value.id, data)
    if (res.code === 200) {
      ElMessage.success('预约修改成功')
      editDialog.value.visible = false
      loadReservationList()
    } else {
      ElMessage.error(res.message || '修改失败')
    }
  } catch (err) {
    ElMessage.error('修改失败，请重试')
  } finally {
    editDialog.value.submitting = false
  }
}

const handleCancel = async (row) => {
  if (row.status !== 'pending') {
    ElMessage.warning('只能取消待审批状态的预约')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      '确定要取消这个预约吗？',
      '确认取消',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const res = await cancelReservationService(row.id)
    if (res.code === 200) {
      ElMessage.success('预约取消成功')
      loadReservationList()
    } else {
      ElMessage.error(res.message || '取消失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('取消失败')
    }
  }
}

const loadReservationList = async () => {
  loading.value = true
  try {
    const res = await getMyReservationsService()
    if (res.code === 200) {
      reservationList.value = Array.isArray(res.data) ? res.data : (res.data?.records || [])
    }
  } catch (err) {
    console.error('获取预约列表失败', err)
    // 使用模拟数据作为兜底
    reservationList.value = [
      {
        id: 1,
        roomName: '琴房A',
        startTime: '2024-01-15T14:00:00',
        endTime: '2024-01-15T16:00:00',
        purpose: '钢琴练习',
        status: 'pending'
      }
    ]
  } finally {
    loading.value = false
  }
}

const getStatusText = (status) => {
  const map = { pending: '待审批', approved: '已通过', rejected: '已拒绝' }
  return map[status] || status
}

const getStatusTag = (status) => {
  const map = { pending: 'warning', approved: 'success', rejected: 'danger' }
  return map[status] || 'info'
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

const formatTime = (str) => {
  if (!str) return ''
  const date = new Date(str)
  if (isNaN(date.getTime())) return str
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

onMounted(() => {
  loadReservationList()
})
</script>

<style scoped lang="scss">
.reserve-container {
  padding: 20px;
  background-color: #f5f7fa;

  .card-header {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }

  .reserve-form {
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