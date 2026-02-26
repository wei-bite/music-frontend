<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>琴房预约审批</span>
        <!-- 这里不放“新增”按钮 -->
      </div>
    </template>

    <el-table
      v-loading="loading"
      :data="list"
      style="width: 100%"
      empty-text="暂无待审批预约"
    >
      <el-table-column prop="username" label="申请人" width="220" />
      <el-table-column prop="roomName" label="申请琴房" width="220" />
      <el-table-column label="预约时间" width="250">
        <template #default="{ row }">
          {{ formatDateTime(row.startTime) }} ~ {{ formatDateTime(row.endTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="purpose" label="用途" min-width="210" />
      <el-table-column label="申请时间" width="200">
        <template #default="{ row }">
          {{ formatDateTime(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button
            size="small"
            type="success"
            @click="handleApprove(row)"
            :loading="approvingId === row.id"
          >
            通过
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="handleReject(row)"
            :loading="rejectingId === row.id"
          >
            拒绝
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>

  <!-- 审批通过弹窗：选择分配琴房 -->
  <el-dialog v-model="approveDialogVisible" title="分配琴房" width="400px">
    <el-form :model="approveForm" :rules="approveRules" ref="approveFormRef" label-width="80px">
      <el-form-item label="分配琴房" prop="assignedRoomId">
        <el-select v-model="approveForm.assignedRoomId" placeholder="请选择可用琴房" style="width: 100%">
          <el-option
            v-for="room in availableRooms"
            :key="room.id"
            :label="`${room.name} (${room.type})`"
            :value="room.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="approveDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitApprove" :loading="submittingApprove">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

// API
import {
  getPendingReservationsService,
  approveReservationService,
  rejectReservationService,
  getPracticeRoomListService
} from '@/api/admin/practice-rooms'

// 数据
const list = ref([])
const loading = ref(false)
const approvingId = ref(null)
const rejectingId = ref(null)

// 分配琴房相关
const approveDialogVisible = ref(false)
const currentReservation = ref(null)
const availableRooms = ref([])
const approveFormRef = ref(null)
const submittingApprove = ref(false)

const approveForm = reactive({
  assignedRoomId: null
})

const approveRules = {
  assignedRoomId: [{ required: true, message: '请选择分配的琴房', trigger: 'change' }]
}

// 加载待审列表
const loadPendingList = async () => {
  loading.value = true
  try {
    const res = await getPendingReservationsService()
    if (res.code === 200) {
      list.value = res.data || []
    } else {
      ElMessage.error(res.message || '获取失败')
    }
  } catch (err) {
    ElMessage.error('网络错误')
    console.error(err)
  } finally {
    loading.value = false
  }
}

// 加载可用琴房
const loadAvailableRooms = async () => {
  try {
    const res = await getPracticeRoomListService()
    if (res.code === 200) {
      availableRooms.value = (res.data || []).filter(r => r.status === 'available')
    }
  } catch (err) {
    ElMessage.error('加载琴房列表失败')
    console.error(err)
  }
}

// 格式化时间
const formatDateTime = (isoStr) => {
  return isoStr ? dayjs(isoStr).format('YYYY-MM-DD HH:mm') : '—'
}

// 拒绝
const handleReject = (row) => {
  ElMessageBox.confirm(`确定拒绝 ${row.username} 的预约申请？`, '提示', {
    type: 'warning'
  }).then(async () => {
    rejectingId.value = row.id
    try {
      await rejectReservationService({ reservationId: row.id })
      ElMessage.success('已拒绝')
      loadPendingList()
    } catch (err) {
      ElMessage.error(err.response?.data?.message || '操作失败')
    } finally {
      rejectingId.value = null
    }
  })
}

// 通过
const handleApprove = (row) => {
  currentReservation.value = row
  approveForm.assignedRoomId = null
  approveDialogVisible.value = true
  loadAvailableRooms()
}

// 提交审批
const submitApprove = () => {
  approveFormRef.value.validate(async (valid) => {
    if (!valid) return
    submittingApprove.value = true
    try {
      await approveReservationService({
        reservationId: currentReservation.value.id,
        assignedRoomId: approveForm.assignedRoomId
      })
      ElMessage.success('已通过并分配琴房')
      approveDialogVisible.value = false
      loadPendingList()
    } catch (err) {
      ElMessage.error(err.response?.data?.message || '审批失败')
    } finally {
      submittingApprove.value = false
    }
  })
}

onMounted(() => {
  loadPendingList()
})
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
}
</style>