<template>
  <div class="instrument-rental-admin-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ statistics.totalApplications }}</div>
            <div class="stat-label">总申请数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ statistics.pendingApplications }}</div>
            <div class="stat-label">待审批</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ statistics.approvedRentals }}</div>
            <div class="stat-label">已批准</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ statistics.overdueRentals }}</div>
            <div class="stat-label">逾期</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">¥{{ statistics.totalRevenue }}</div>
            <div class="stat-label">总收入</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">¥{{ statistics.monthlyRevenue }}</div>
            <div class="stat-label">月收入</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 主选项卡 -->
    <el-tabs v-model="activeMainTab" type="border-card" class="main-tabs-container">
      <!-- 乐器租借管理 -->
      <el-tab-pane label="租借管理" name="rental" :lazy="true">
        <el-tabs v-model="activeSubTab" type="card" class="sub-tabs-container">
          <!-- 即将到期租借 -->
          <el-tab-pane label="即将到期租借" name="expiring" :lazy="true">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>即将到期租借列表</span>
                  <div class="header-controls">
                    <el-input 
                      v-model="expiringFilter.days" 
                      placeholder="输入天数" 
                      style="width: 120px; margin-right: 10px;"
                      type="number"
                      @change="fetchExpiringRentalsList"
                    />
                  </div>
                </div>
              </template>
              <el-table 
                :data="expiringRentalsList" 
                v-loading="expiringLoading"
                style="width: 100%"
              >
                <el-table-column prop="modelName" label="型号名称" width="150" />
                <el-table-column prop="brand" label="品牌" width="120" />
                <el-table-column prop="type" label="乐器类型" width="120" />
                <el-table-column prop="serialNumber" label="序列号" width="150" />
                <el-table-column prop="renterName" label="租借人姓名" width="120" />
                <el-table-column prop="renterUsername" label="用户名" width="120" />
                <el-table-column prop="renterPhone" label="联系电话" width="140" />
                <el-table-column prop="rentedFrom" label="租借开始" width="120" />
                <el-table-column prop="rentedTo" label="租借结束" width="120" />
                <el-table-column prop="rentDays" label="租借天数" width="120" />
                <el-table-column label="操作" width="150" fixed="right">
                  <template #default="{ row }">
                    <el-button type="primary" size="small" @click="viewRentalDetails(row)">
                      查看详情
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-tab-pane>

          <!-- 逾期租借 -->
          <el-tab-pane label="逾期租借" name="overdue" :lazy="true">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>逾期租借列表</span>
                </div>
              </template>
              <el-table 
                :data="overdueRentalsList" 
                v-loading="overdueLoading"
                style="width: 100%"
              >
                <el-table-column prop="modelName" label="型号名称" width="150" />
                <el-table-column prop="brand" label="品牌" width="120" />
                <el-table-column prop="type" label="乐器类型" width="120" />
                <el-table-column prop="serialNumber" label="序列号" width="150" />
                <el-table-column prop="renterName" label="租借人姓名" width="120" />
                <el-table-column prop="renterUsername" label="用户名" width="120" />
                <el-table-column prop="renterPhone" label="联系电话" width="140" />
                <el-table-column prop="rentedFrom" label="租借开始" width="120" />
                <el-table-column prop="rentedTo" label="租借结束" width="120" />
                <el-table-column prop="overdueDays" label="逾期天数" width="120">
                  <template #default="{ row }">
                    <el-tag type="danger">{{ row.overdueDays }}天</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200" fixed="right">
                  <template #default="{ row }">
                    <el-button type="warning" size="small" @click="sendOverdueNotice(row)">
                      发送提醒
                    </el-button>
                    <el-button type="primary" size="small" @click="viewRentalDetails(row)">
                      查看详情
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>

      <!-- 已租出乐器 -->
      <el-tab-pane label="已租出乐器" name="rented" :lazy="true">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>已租出乐器列表</span>
            </div>
          </template>
          <el-table 
            :data="rentedInstruments" 
            v-loading="rentedLoading"
            style="width: 100%"
          >
            <el-table-column prop="instrumentId" label="乐器实例ID" width="120" />
            <el-table-column prop="modelName" label="型号名称" width="150" />
            <el-table-column prop="brand" label="品牌" width="120" />
            <el-table-column prop="type" label="类型" width="120" />
            <el-table-column prop="serialNumber" label="序列号" width="150" />
            <el-table-column prop="rentedByUserId" label="租借人ID" width="120" />
            <el-table-column prop="renterUsername" label="租借人用户名" width="150" />
            <el-table-column prop="renterName" label="租借人姓名" width="150" />
            <el-table-column prop="renterPhone" label="租借人电话" width="150" />
            <el-table-column prop="rentedFrom" label="租借开始日期" width="150">
              <template #default="{ row }">
                {{ formatDate(row.rentedFrom) }}
              </template>
            </el-table-column>
            <el-table-column prop="rentedTo" label="租借结束日期" width="150">
              <template #default="{ row }">
                {{ formatDate(row.rentedTo) }}
              </template>
            </el-table-column>
            <el-table-column prop="rentDays" label="租借天数" width="120" />
            <el-table-column fixed="right" label="操作" width="150">
              <template #default="{ row }">
                <el-button type="warning" size="small" @click="forceReturnInstrument(row.instrumentId)">
                  强制归还
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 分页 -->
          <el-pagination
            background
            layout="prev, pager, next"
            :total="rentedTotal"
            :page-size="rentedPagination.pageSize"
            :current-page="rentedPagination.pageNum"
            @current-change="handleRentedPageChange"
            style="margin-top: 20px; text-align: center;"
          />
        </el-card>
      </el-tab-pane>

      <!-- 已售出乐器 -->
      <el-tab-pane label="已售出乐器" name="sold" :lazy="true">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>已售出乐器列表</span>
            </div>
          </template>
          <el-table 
            :data="soldInstruments" 
            v-loading="soldLoading"
            style="width: 100%"
          >
            <el-table-column prop="instrumentId" label="乐器实例ID" width="120" />
            <el-table-column prop="modelName" label="型号名称" width="150" />
            <el-table-column prop="brand" label="品牌" width="120" />
            <el-table-column prop="type" label="类型" width="120" />
            <el-table-column prop="serialNumber" label="序列号" width="150" />
            <el-table-column prop="salePrice" label="售价（元）" width="120">
              <template #default="{ row }">
                ¥{{ formatPrice(row.salePrice) }}
              </template>
            </el-table-column>
            <el-table-column prop="ownerUserId" label="购买者ID" width="120" />
            <el-table-column prop="buyerUsername" label="购买者用户名" width="150" />
            <el-table-column prop="buyerName" label="购买者姓名" width="150" />
            <el-table-column prop="buyerPhone" label="购买者电话" width="150" />
            <el-table-column prop="soldAt" label="售出时间" width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.soldAt) }}
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 分页 -->
          <el-pagination
            background
            layout="prev, pager, next"
            :total="soldTotal"
            :page-size="soldPagination.pageSize"
            :current-page="soldPagination.pageNum"
            @current-change="handleSoldPageChange"
            style="margin-top: 20px; text-align: center;"
          />
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="detailDialog.visible"
      :title="detailDialog.title"
      width="600px"
      destroy-on-close
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="乐器ID">{{ detailDialog.row.instrumentId }}</el-descriptions-item>
        <el-descriptions-item label="型号名称">{{ detailDialog.row.modelName }}</el-descriptions-item>
        <el-descriptions-item label="品牌">{{ detailDialog.row.brand }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ detailDialog.row.type }}</el-descriptions-item>
        <el-descriptions-item label="序列号">{{ detailDialog.row.serialNumber }}</el-descriptions-item>
        <el-descriptions-item label="租借人姓名">{{ detailDialog.row.renterName }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ detailDialog.row.renterUsername }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ detailDialog.row.renterPhone }}</el-descriptions-item>
        <el-descriptions-item label="租借开始日期">{{ formatDate(detailDialog.row.rentedFrom) }}</el-descriptions-item>
        <el-descriptions-item label="租借结束日期">{{ formatDate(detailDialog.row.rentedTo) }}</el-descriptions-item>
        <el-descriptions-item label="租借天数">{{ detailDialog.row.rentDays }}天</el-descriptions-item>
        <el-descriptions-item v-if="detailDialog.row.overdueDays" label="逾期天数">
          <el-tag type="danger">{{ detailDialog.row.overdueDays }}天</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">{{ detailDialog.row.status }}</el-descriptions-item>
      </el-descriptions>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialog.visible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { 
  getRentalStatisticsService,
  getExpiringRentalsListService,
  getOverdueRentalsListService,
  sendOverdueNoticeService
} from '@/api/admin/instrument-rental'
import {
  getRentedInstrumentsService,
  forceReturnInstrumentService
} from '@/api/admin/instrument'
import {
  getSoldInstrumentsService
} from '@/api/admin/instrument'

// 响应式数据
const activeMainTab = ref('rental')
const activeSubTab = ref('overdue')

// 统计数据
const statistics = reactive({
  totalApplications: 0,
  pendingApplications: 0,
  approvedRentals: 0,
  overdueRentals: 0,
  totalRevenue: '0.00',
  monthlyRevenue: '0.00'
})

// 租借相关数据
const expiringRentalsList = ref([])
const overdueRentalsList = ref([])
const expiringLoading = ref(false)
const overdueLoading = ref(false)
const expiringFilter = reactive({
  days: null
})

// 已租出乐器数据
const rentedInstruments = ref([])
const rentedTotal = ref(0)
const rentedLoading = ref(false)
const rentedPagination = reactive({
  pageNum: 1,
  pageSize: 10
})

// 已售出乐器数据
const soldInstruments = ref([])
const soldTotal = ref(0)
const soldLoading = ref(false)
const soldPagination = reactive({
  pageNum: 1,
  pageSize: 10
})

// 详情对话框数据
const detailDialog = reactive({
  visible: false,
  title: '查看详情',
  row: {}
})

// 获取租借统计信息
const fetchRentalStatistics = async () => {
  try {
    const res = await getRentalStatisticsService()
    if (res.code === 200 && res.data) {
      Object.assign(statistics, res.data)
    } else {
      ElMessage.error(res.message || '获取租借统计失败')
    }
  } catch (error) {
    console.error('获取租借统计失败:', error)
    ElMessage.error('获取租借统计失败')
    // 模拟数据兜底
    statistics.totalApplications = 150
    statistics.pendingApplications = 5
    statistics.approvedRentals = 45
    statistics.overdueRentals = 2
    statistics.totalRevenue = '25000.00'
    statistics.monthlyRevenue = '3500.00'
  }
}

// 获取即将到期租借列表
const fetchExpiringRentalsList = async () => {
  expiringLoading.value = true
  try {
    const params = expiringFilter.days ? { days: expiringFilter.days } : {}
    const res = await getExpiringRentalsListService(params)
    if (res.code === 200) {
      expiringRentalsList.value = res.data || []
    } else {
      ElMessage.error(res.message || '获取即将到期租借列表失败')
    }
  } catch (error) {
    console.error('获取即将到期租借列表失败:', error)
    ElMessage.error('获取即将到期租借列表失败')
    // 模拟数据兜底
    expiringRentalsList.value = [
      {
        instrumentId: 1,
        modelName: "雅马哈钢琴",
        brand: "Yamaha",
        type: "钢琴",
        serialNumber: "SN123456789",
        rentedByUserId: 1001,
        renterUsername: "student001",
        renterName: "张三",
        renterPhone: "13800138000",
        rentedFrom: "2024-01-25",
        rentedTo: "2024-02-01",
        rentDays: 7,
        status: "rented"
      }
    ]
  } finally {
    expiringLoading.value = false
  }
}

// 获取逾期租借列表
const fetchOverdueRentalsList = async () => {
  overdueLoading.value = true
  try {
    const res = await getOverdueRentalsListService()
    if (res.code === 200) {
      overdueRentalsList.value = res.data || []
    } else {
      ElMessage.error(res.message || '获取逾期租借列表失败')
    }
  } catch (error) {
    console.error('获取逾期租借列表失败:', error)
    ElMessage.error('获取逾期租借列表失败')
    // 模拟数据兜底 - 与接口文档保持一致
    overdueRentalsList.value = [
      {
        instrumentId: 2,
        modelName: "古典吉他",
        brand: "卡马",
        type: "吉他",
        serialNumber: "SN987654321",
        rentedByUserId: 1002,
        renterUsername: "student002",
        renterName: "李四",
        renterPhone: "13900139000",
        rentedFrom: "2024-01-10",
        rentedTo: "2024-01-20",
        overdueDays: 5,
        status: "rented"
      },
      {
        instrumentId: 3,
        modelName: "雅马哈钢琴",
        brand: "Yamaha",
        type: "钢琴",
        serialNumber: "SN111222333",
        rentedByUserId: 1003,
        renterUsername: "student003",
        renterName: "王五",
        renterPhone: "13700137000",
        rentedFrom: "2024-01-05",
        rentedTo: "2024-01-15",
        overdueDays: 12,
        status: "rented"
      }
    ]
  } finally {
    overdueLoading.value = false
  }
}

// 获取已租出乐器列表
const fetchRentedInstruments = async () => {
  rentedLoading.value = true
  try {
    const res = await getRentedInstrumentsService({
      pageNum: rentedPagination.pageNum,
      pageSize: rentedPagination.pageSize
    })
    if (res.code === 200) {
      rentedInstruments.value = res.data || []
      rentedTotal.value = res.data.total || 0
    } else {
      ElMessage.error(res.message || '获取已租出乐器列表失败')
    }
  } catch (error) {
    console.error('获取已租出乐器列表失败:', error)
    ElMessage.error('获取已租出乐器列表失败')
    // 模拟数据兜底
    rentedInstruments.value = [
      {
        instrumentId: 1,
        modelName: "雅马哈钢琴",
        brand: "Yamaha",
        type: "钢琴",
        serialNumber: "SN123456789",
        rentedByUserId: 1001,
        renterUsername: "student001",
        renterName: "张三",
        renterPhone: "13800138000",
        rentedFrom: "2024-01-25",
        rentedTo: "2024-02-01",
        rentDays: 7
      }
    ]
    rentedTotal.value = 1
  } finally {
    rentedLoading.value = false
  }
}

// 获取已售出乐器列表
const fetchSoldInstruments = async () => {
  soldLoading.value = true
  try {
    const res = await getSoldInstrumentsService({
      pageNum: soldPagination.pageNum,
      pageSize: soldPagination.pageSize
    })
    if (res.code === 200) {
      soldInstruments.value = res.data || []
      soldTotal.value = res.data.total || 0
    } else {
      ElMessage.error(res.message || '获取已售出乐器列表失败')
    }
  } catch (error) {
    console.error('获取已售出乐器列表失败:', error)
    ElMessage.error('获取已售出乐器列表失败')
    // 模拟数据兜底
    soldInstruments.value = [
      {
        instrumentId: 1,
        modelName: "古典吉他",
        brand: "卡马",
        type: "吉他",
        serialNumber: "SN987654321",
        salePrice: 1200.00,
        ownerUserId: 1001,
        buyerUsername: "student001",
        buyerName: "张三",
        buyerPhone: "13800138000",
        soldAt: "2024-01-15T10:30:00"
      }
    ]
    soldTotal.value = 1
  } finally {
    soldLoading.value = false
  }
}

// 发送逾期提醒
const sendOverdueNotice = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定向用户 ${row.renterName}(${row.renterUsername}) 发送逾期提醒？`,
      '发送逾期提醒',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const res = await sendOverdueNoticeService(row.instrumentId)
    if (res.code === 200) {
      ElMessage.success('逾期提醒发送成功')
      // 重新获取逾期列表
      fetchOverdueRentalsList()
    } else {
      ElMessage.error(res.message || '发送逾期提醒失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('发送逾期提醒失败:', error)
      ElMessage.error('发送逾期提醒失败')
    }
  }
}

// 强制归还乐器
const forceReturnInstrument = async (instrumentId) => {
  try {
    await ElMessageBox.confirm(
      '确定强制归还此乐器？',
      '强制归还',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const res = await forceReturnInstrumentService(instrumentId)
    if (res.code === 200) {
      ElMessage.success('强制归还成功')
      // 重新获取已租出列表
      fetchRentedInstruments()
    } else {
      ElMessage.error(res.message || '强制归还失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('强制归还失败:', error)
      ElMessage.error('强制归还失败')
    }
  }
}

// 查看租借详情
const viewRentalDetails = (row) => {
  detailDialog.row = { ...row }
  detailDialog.title = `查看 ${row.modelName} 详情`
  detailDialog.visible = true
}

// 分页相关方法
const handleRentedPageChange = (newPage) => {
  rentedPagination.pageNum = newPage
  fetchRentedInstruments()
}

const handleSoldPageChange = (newPage) => {
  soldPagination.pageNum = newPage
  fetchSoldInstruments()
}

// 格式化日期
const formatDate = (dateStr) => {
  return dayjs(dateStr).format('YYYY-MM-DD')
}

// 格式化日期时间
const formatDateTime = (dateTimeStr) => {
  return dayjs(dateTimeStr).format('YYYY-MM-DD HH:mm:ss')
}

// 格式化价格
const formatPrice = (price) => {
  return price ? parseFloat(price).toFixed(2) : '0.00'
}

// 初始化数据
onMounted(async () => {
  await fetchRentalStatistics()
  await fetchExpiringRentalsList()
  await fetchOverdueRentalsList()
  await fetchRentedInstruments()
  await fetchSoldInstruments()
})
</script>

<style scoped lang="scss">
.instrument-rental-admin-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;

  .stats-row {
    margin-bottom: 25px;
    gap: 20px;

    .el-col {
      padding: 0 10px;
    }

    .stat-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      border: 1px solid #e4e7ed;
      transition: all 0.3s ease;
      background: white;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
      }

      .stat-content {
        text-align: center;
        padding: 25px 15px;

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #409eff;
          margin-bottom: 10px;
        }

        .stat-label {
          font-size: 14px;
          color: #606266;
          font-weight: 500;
        }
      }
    }
  }

  .main-tabs-container {
    :deep(.el-tabs__content) {
      padding: 0;
    }

    .sub-tabs-container {
      :deep(.el-tabs__content) {
        padding: 0;
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;

      .header-controls {
        display: flex;
        align-items: center;
      }
    }

    .el-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      border: 1px solid #e4e7ed;
      margin-bottom: 25px;
      background: white;

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
}
</style>