<template>
  <div class="rented-instruments-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>已租出乐器列表</span>
        </div>
      </template>

      <!-- 表格 -->
      <el-table :data="rentedInstruments" style="width: 100%">
        <el-table-column prop="instrumentId" label="乐器实例ID" width="120" />
        <el-table-column prop="modelName" label="型号名称" width="180" />
        <el-table-column prop="brand" label="品牌" width="120" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="serialNumber" label="序列号" width="180" />
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
            <el-button type="warning" size="small" @click="forceReturnInstrument(row.instrumentId)">强制归还</el-button>
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
  getRentedInstrumentsService,
  forceReturnInstrumentService
} from '@/api/admin/instrument'

// 数据状态
const rentedInstruments = ref([])
const total = ref(0)
const pagination = reactive({
  pageNum: 1,
  pageSize: 10
})

// 加载已租出乐器列表
const loadRentedInstruments = async () => {
  try {
    const res = await getRentedInstrumentsService({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    })
    console.log(res);
    
    if (res.code === 200) {
      rentedInstruments.value = res.data || []
      total.value = res.data.total || 0
    }
  } catch (err) {
    ElMessage.error('加载已租出乐器列表失败')
    console.error(err)
  }
}

// 格式化日期
const formatDate = (dateStr) => {
  return dayjs(dateStr).format('YYYY-MM-DD')
}

// 强制归还乐器
const forceReturnInstrument = async (instrumentId) => {
  try {
    await forceReturnInstrumentService(instrumentId)
    ElMessage.success('强制归还成功')
    loadRentedInstruments()
  } catch (err) {
    ElMessage.error('强制归还失败')
    console.error(err)
  }
}

// 分页切换
const handlePageChange = (newPage) => {
  pagination.pageNum = newPage
  loadRentedInstruments()
}

// 初始化加载数据
onMounted(() => {
  loadRentedInstruments()
})
</script>

<style scoped lang="scss">
.rented-instruments-list {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  .card-header {
    font-size: 18px;
    font-weight: bold;
  }
}
</style>