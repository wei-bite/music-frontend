<template>
  <div class="sold-instruments-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>已售出乐器列表</span>
        </div>
      </template>

      <!-- 表格 -->
      <el-table :data="soldInstruments" style="width: 100%" border>
        <el-table-column prop="instrumentId" label="乐器实例ID" width="120" />
        <el-table-column prop="modelName" label="型号名称" width="180" />
        <el-table-column prop="brand" label="品牌" width="120" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="serialNumber" label="序列号" width="180" />
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

        <!-- 固定在右侧的操作列（目前无操作，但保留结构） -->
        <el-table-column label="操作" fixed="right" width="80">
          <template #default>
            <!-- 可扩展：如查看合同、导出凭证等 -->
            <span class="no-op">—</span>
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
import dayjs from 'dayjs'

// 导入 API
import {
  getSoldInstrumentsService
} from '@/api/admin/instrument'

// 数据状态
const soldInstruments = ref([])
const total = ref(0)
const pagination = reactive({
  pageNum: 1,
  pageSize: 10
})

// 加载已售出列表
const loadSoldInstruments = async () => {
  try {
    const res = await getSoldInstrumentsService({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    })
    if (res.code === 200) {
      soldInstruments.value = res.data || []
      total.value = res.data.total || 0
    }
  } catch (err) {
    ElMessage.error('加载已售出乐器列表失败')
    console.error(err)
  }
}

// 格式化价格（保留两位小数）
const formatPrice = (price) => {
  return price ? parseFloat(price).toFixed(2) : '0.00'
}

// 格式化日期时间
const formatDateTime = (dateTimeStr) => {
  return dayjs(dateTimeStr).format('YYYY-MM-DD HH:mm:ss')
}

// 分页切换
const handlePageChange = (newPage) => {
  pagination.pageNum = newPage
  loadSoldInstruments()
}

// 初始化
onMounted(() => {
  loadSoldInstruments()
})
</script>

<style scoped lang="scss">
.sold-instruments-list {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  .card-header {
    font-size: 18px;
    font-weight: bold;
  }

  .no-op {
    color: #999;
    font-size: 14px;
  }
}
</style>