<template>
  <div class="instrument-rental-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>待审批租借申请列表</span>
        </div>
      </template>

      <!-- 表格 -->
      <el-table :data="rentalApplications" style="width: 100%">
        <el-table-column prop="instrumentId" label="乐器实例ID" width="180" />
        <el-table-column prop="modelName" label="型号名称" width="180" />
        <el-table-column prop="serialNumber" label="序列号" width="180" />
        <el-table-column prop="applicantUsername" label="申请人用户名" width="180" />
        <el-table-column prop="applyTime" label="申请时间" width="200">
          <template #default="{ row }">
            {{ formatDateTime(row.applyTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="success" size="small" @click="approveRental(row.instrumentId)">批准</el-button>
            <el-button type="danger" size="small" @click="rejectRental(row.instrumentId)">拒绝</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="pagination.pageSize"
        :current-page="pagination.pageNum"
        @current-change="handlePageChange"
        style="margin-top: 20px; text-align: center;"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs' // 导入 dayjs 用于日期格式化

// 导入相关 API 函数
import {
  getPendingRentalsService,
  approveRentalService,
  rejectRentalService
} from '@/api/admin/instrument'

// 数据状态
const rentalApplications = ref([])
const total = ref(0)
const pagination = reactive({
  pageNum: 1,
  pageSize: 10
})

// 加载待审批租借申请列表
const loadRentals = async () => {
  try {
    const res = await getPendingRentalsService({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    })
    console.log(res);
    
    if (res.code === 200) {
      rentalApplications.value = res.data || []
      total.value = res.data.total || 0
    }
  } catch (err) {
    ElMessage.error('加载待审批租借申请失败')
    console.error(err)
  }
}

// 格式化日期时间
const formatDateTime = (dateTimeStr) => {
  return dayjs(dateTimeStr).format('YYYY-MM-DD HH:mm:ss')
}

// 批准租借申请
const approveRental = async (instrumentId) => {
  try {
    await approveRentalService(instrumentId)
    ElMessage.success('租借申请已批准')
    loadRentals()
  } catch (err) {
    ElMessage.error('批准租借申请失败')
    console.error(err)
  }
}

// 拒绝租借申请
const rejectRental = async (instrumentId) => {
  try {
    await rejectRentalService(instrumentId)
    ElMessage.success('租借申请已拒绝')
    loadRentals()
  } catch (err) {
    ElMessage.error('拒绝租借申请失败')
    console.error(err)
  }
}

// 分页切换
const handlePageChange = (newPage) => {
  pagination.pageNum = newPage
  loadRentals()
}

// 初始化加载数据
onMounted(() => {
  loadRentals()
})
</script>

<style scoped lang="scss">
.instrument-rental-list {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  .card-header {
    font-size: 18px;
    font-weight: bold;
  }
}
</style>