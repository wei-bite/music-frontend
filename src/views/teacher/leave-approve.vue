<template>
  <div class="leave-approve-container">
    <el-card shadow="never" style="border-radius: 8px; border: 1px solid #e4e7ed;">
      <template #header>
        <div class="card-header">
          <span>学生请假审批</span>
        </div>
      </template>

      <!-- 筛选区域 -->
      <div class="filter-bar">
        <el-radio-group v-model="filterStatus" @change="handleFilterChange">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button value="pending">待审批</el-radio-button>
          <el-radio-button value="approved">已批准</el-radio-button>
          <el-radio-button value="rejected">已拒绝</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 表格 -->
      <el-table :data="filteredList" style="width: 100%" v-loading="loading" border>
        <el-table-column prop="studentName" label="学生姓名" min-width="100" align="center">
          <template #default="{ row }">
            {{ row.studentName || row.userName || `学员${row.userId}` }}
          </template>
        </el-table-column>
        <el-table-column prop="type" label="请假类型" min-width="80" align="center">
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
        <el-table-column prop="status" label="状态" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="申请时间" min-width="160" align="center">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt || row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="180" align="center">
          <template #default="{ row }">
            <div class="action-buttons" v-if="canApprove(row.status)">
              <el-button type="success" size="small" @click="handleApprove(row.id)">
                批准
              </el-button>
              <el-button type="danger" size="small" @click="handleReject(row.id)">
                拒绝
              </el-button>
            </div>
            <span v-else class="text-muted">已处理</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <el-empty v-if="!loading && filteredList.length === 0" description="暂无请假记录" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getLeaveRequestsService, approveLeaveRequestService } from '@/api/teacher/teacher'

const loading = ref(false)
const leaveList = ref([])
const filterStatus = ref('')

// 筛选后的列表
const filteredList = computed(() => {
  if (!filterStatus.value) return leaveList.value
  return leaveList.value.filter(item => item.status === filterStatus.value)
})

// 加载请假列表
const loadLeaveList = async () => {
  loading.value = true
  try {
    const res = await getLeaveRequestsService()
    if (res.code === 200) {
      leaveList.value = Array.isArray(res.data) ? res.data : (res.data?.records || [])
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

// 批准请假
const handleApprove = (id) => {
  ElMessageBox.confirm('确定批准该请假申请吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      const res = await approveLeaveRequestService(id, 'approved')
      if (res.code === 200) {
        ElMessage.success('已批准')
        loadLeaveList()
      } else {
        ElMessage.error(res.message || '操作失败')
      }
    } catch (err) {
      ElMessage.error('操作失败，请重试')
    }
  })
}

// 拒绝请假
const handleReject = (id) => {
  ElMessageBox.confirm('确定拒绝该请假申请吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await approveLeaveRequestService(id, 'rejected')
      if (res.code === 200) {
        ElMessage.success('已拒绝')
        loadLeaveList()
      } else {
        ElMessage.error(res.message || '操作失败')
      }
    } catch (err) {
      ElMessage.error('操作失败，请重试')
    }
  })
}

const handleFilterChange = () => {
  // 筛选状态变化，computed 自动更新
}

// 请假类型
const getLeaveTypeText = (type) => {
  const map = { sick: '病假', personal: '事假' }
  return map[type] || type
}

const getLeaveTypeTag = (type) => {
  const map = { sick: 'danger', personal: 'warning' }
  return map[type] || 'info'
}

// 状态
const getStatusText = (status) => {
  const map = { 
    pending: '待审批', 
    approved: '已批准', 
    rejected: '已拒绝',
    cancelled: '已取消'  // 即使现在是软删除，也可能在某些场景下存在此状态
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

// 日期格式化
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

// 检查是否可以审批（仅限待审批状态）
const canApprove = (status) => {
  return status === 'pending'
}

onMounted(() => {
  loadLeaveList()
})
</script>

<style scoped lang="scss">
.leave-approve-container {
  padding: 20px;
  background-color: #f5f7fa;

  .card-header {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }

  .filter-bar {
    margin-bottom: 20px;
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

  .action-buttons {
    display: flex;
    gap: 8px;
    justify-content: center;
  }

  .text-muted {
    color: #909399;
    font-size: 13px;
  }
}
</style>