<template>
  <div class="instrument-rental-container">
    <el-row :gutter="20">
      <!-- 租借资格检查卡片 -->
      <el-col :span="24">
        <el-card class="eligibility-card">
          <template #header>
            <div class="card-header">
              <span>租借资格检查</span>
              <el-tag :type="eligibilityStatus ? 'success' : 'danger'">
                {{ eligibilityStatus ? '有资格' : '无资格' }}
              </el-tag>
            </div>
          </template>
          <div class="eligibility-content">
            <p v-if="eligibilityStatus" class="status-message success">
              ✓ 您当前具备租借乐器的资格，可以提交租借申请
            </p>
            <p v-else class="status-message error">
              ✗ 您当前不具备租借乐器的资格，请联系管理员了解详情
            </p>
            <el-button 
              type="primary" 
              :disabled="!eligibilityStatus"
              @click="navigateToRentPage"
              style="margin-top: 15px;"
            >
              开始租借乐器
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 即将到期租借 -->
      <el-col :span="24" v-if="expiringRentals.length > 0">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>即将到期租借</span>
              <el-tag type="warning">即将到期</el-tag>
            </div>
          </template>
          <el-table :data="expiringRentals" style="width: 100%">
            <el-table-column prop="modelName" label="型号名称" width="150" />
            <el-table-column prop="brand" label="品牌" width="120" />
            <el-table-column prop="type" label="乐器类型" width="120" />
            <el-table-column prop="serialNumber" label="序列号" width="150" />
            <el-table-column label="封面图片" width="120">
              <template #default="{ row }">
                <el-image 
                  :src="row.coverUrl" 
                  :preview-src-list="[row.coverUrl]"
                  fit="cover"
                  style="width: 60px; height: 60px; border-radius: 4px;"
                  :preview-teleported="true"
                />
              </template>
            </el-table-column>
            <el-table-column prop="rentedFrom" label="租借开始" width="120" />
            <el-table-column prop="rentedTo" label="租借结束" width="120" />
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="viewDetails(row)">
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 租借申请历史 -->
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>租借申请历史</span>
              <el-button type="primary" size="small" @click="refreshHistory">
                刷新
              </el-button>
            </div>
          </template>
          <el-table 
            :data="rentalHistory" 
            v-loading="historyLoading"
            style="width: 100%"
          >
            <el-table-column prop="modelName" label="型号名称" width="150" />
            <el-table-column prop="brand" label="品牌" width="120" />
            <el-table-column prop="type" label="乐器类型" width="120" />
            <el-table-column prop="serialNumber" label="序列号" width="150" />
            <el-table-column prop="status" label="状态" width="120">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="applyDate" label="申请日期" width="160" />
            <el-table-column prop="rentDays" label="租借天数" width="120" />
            <el-table-column prop="rentedFrom" label="租借开始" width="120" />
            <el-table-column prop="rentedTo" label="租借结束" width="120" />
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="viewHistoryDetails(row)">
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { 
  checkRentalEligibilityService, 
  getRentalApplicationHistoryService, 
  getExpiringRentalsService 
} from '@/api/user/instrument-rental'

const router = useRouter()

// 响应式数据
const eligibilityStatus = ref(false)
const rentalHistory = ref([])
const expiringRentals = ref([])
const historyLoading = ref(false)

// 获取租借资格
const fetchEligibility = async () => {
  try {
    const res = await checkRentalEligibilityService()
    if (res.code === 200) {
      eligibilityStatus.value = res.data
    } else {
      ElMessage.error(res.message || '获取租借资格失败')
    }
  } catch (error) {
    console.error('获取租借资格失败:', error)
    ElMessage.error('获取租借资格失败')
  }
}

// 获取租借申请历史
const fetchRentalHistory = async () => {
  historyLoading.value = true
  try {
    const res = await getRentalApplicationHistoryService()
    if (res.code === 200) {
      rentalHistory.value = res.data || []
    } else {
      ElMessage.error(res.message || '获取租借申请历史失败')
    }
  } catch (error) {
    console.error('获取租借申请历史失败:', error)
    ElMessage.error('获取租借申请历史失败')
    // 模拟数据兜底
    rentalHistory.value = [
      {
        instrumentId: 1,
        modelName: "雅马哈钢琴",
        brand: "Yamaha",
        type: "钢琴",
        serialNumber: "SN123456789",
        status: "returned",
        applyDate: "2024-01-15T10:30:00",
        rentDays: 7,
        rentedFrom: "2024-01-15",
        rentedTo: "2024-01-22"
      },
      {
        instrumentId: 2,
        modelName: "古典吉他",
        brand: "卡马",
        type: "吉他",
        serialNumber: "SN987654321",
        status: "approved",
        applyDate: "2024-01-20T14:15:00",
        rentDays: 14,
        rentedFrom: "2024-01-20",
        rentedTo: "2024-02-03"
      }
    ]
  } finally {
    historyLoading.value = false
  }
}

// 获取即将到期租借
const fetchExpiringRentals = async () => {
  try {
    const res = await getExpiringRentalsService()
    if (res.code === 200) {
      expiringRentals.value = res.data || []
    } else {
      ElMessage.error(res.message || '获取即将到期租借失败')
    }
  } catch (error) {
    console.error('获取即将到期租借失败:', error)
    ElMessage.error('获取即将到期租借失败')
    // 模拟数据兜底
    expiringRentals.value = [
      {
        instrumentId: 3,
        modelName: "电吉他",
        brand: "芬达",
        type: "吉他",
        serialNumber: "SN555666777",
        coverUrl: "/api/files/instrument-cover/guitar.jpg",
        rentedFrom: "2024-01-25",
        rentedTo: "2024-02-01",
        status: "rented"
      }
    ]
  }
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  switch (status) {
    case 'pending': return 'warning'
    case 'approved': return 'success'
    case 'rejected': return 'danger'
    case 'returned': return 'info'
    default: return 'info'
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'pending': return '待审批'
    case 'approved': return '已批准'
    case 'rejected': return '已拒绝'
    case 'returned': return '已归还'
    default: return status
  }
}

// 导航到租借页面
const navigateToRentPage = () => {
  // 跳转到乐器租借页面
  router.push('/student/instrument-rent')
}

// 查看详情
const viewDetails = (row) => {
  ElMessage.info(`查看乐器 ${row.modelName} 的详情`)
}

// 查看历史详情
const viewHistoryDetails = (row) => {
  ElMessage.info(`查看申请历史 ${row.modelName} 的详情`)
}

// 刷新历史
const refreshHistory = () => {
  fetchRentalHistory()
}

// 初始化数据
onMounted(async () => {
  await Promise.all([
    fetchEligibility(),
    fetchRentalHistory(),
    fetchExpiringRentals()
  ])
})
</script>

<style scoped lang="scss">
.instrument-rental-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }

  .eligibility-card {
    margin-bottom: 25px;

    .eligibility-content {
      text-align: center;

      .status-message {
        font-size: 16px;
        padding: 15px;
        border-radius: 6px;
        margin: 15px 0;

        &.success {
          background-color: #f0f9ec;
          color: #67c23a;
        }

        &.error {
          background-color: #fef0f0;
          color: #f56c6c;
        }
      }
    }
  }

  .el-card {
    margin-bottom: 25px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .el-table {
    border-radius: 6px;
    overflow: hidden;

    :deep(.el-table__header) {
      th {
        background-color: #f8f9fa;
        color: #303133;
        font-weight: 600;
        border-bottom: 2px solid #e4e7ed;
        padding: 15px 12px;
      }
    }

    :deep(.el-table__row) {
      &:hover {
        background-color: #f5f7fa;
      }

      td {
        border-bottom: 1px solid #ebeef5;
        padding: 15px 12px;
      }
    }
  }
}
</style>