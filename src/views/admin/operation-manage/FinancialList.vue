<!-- src/views/admin/operation/FinancialList.vue -->
<template>
  <div class="financial-list">
    <!-- 筛选栏 -->
    <el-card shadow="never" style="margin-bottom: 16px">
      <el-form :model="searchParams" inline>
        <!-- 类型 -->
        <el-form-item label="类型" label-width="60px">
          <el-select
            v-model="searchParams.type"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option value="income" label="收入" />
            <el-option value="expense" label="支出" />
          </el-select>
        </el-form-item>

        <!-- 分类 -->
        <el-form-item label="分类" label-width="60px">
          <el-select
            v-model="searchParams.category"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option value="tuition" label="学费" />
            <el-option value="rent" label="租金" />
            <el-option value="sale" label="售卖" />
            <el-option value="purchase" label="采购" />
            <el-option value="salary" label="工资" />
            <el-option value="other" label="其他" />
          </el-select>
        </el-form-item>

        <!-- 日期范围 -->
        <el-form-item label="日期范围" label-width="80px">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 300px"
          />
        </el-form-item>

        <!-- 按钮组 -->
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="openCreate" style="margin-left: 12px">
            + 新增
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-table
      :data="list"
      v-loading="loading"
      border
      style="width: 100%"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="类型" width="100">
        <template #default="{ row }">
          <el-tag :type="row.type === 'income' ? 'success' : 'danger'">
            {{ getTypeLabel(row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="分类" width="120">
        <template #default="{ row }">
          {{ getCategoryLabel(row.category) }}
        </template>
      </el-table-column>
      <el-table-column label="金额" width="120">
        <template #default="{ row }">
          <span :style="{ color: row.type === 'income' ? '#07C160' : '#F56C6C' }">
            ¥{{ row.amount.toFixed(2) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="recordDate" label="记录日期" width="140" />
      <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pagination.pageNum"
      v-model:page-size="pagination.pageSize"
      :total="total"
      layout="total, prev, pager, next"
      style="margin-top: 16px; text-align: right"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    />

    <!-- 表单弹窗 -->
    <FinancialFormDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record-id="currentId"
      @success="loadList"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import FinancialFormDialog from './components/FinancialFormDialog.vue'

import {
  getFinancialRecords,
  deleteFinancialRecord
} from '@/api/admin/operation'

// ====== 配置 ======
const getTypeLabel = (type) => (type === 'income' ? '收入' : '支出')
const getCategoryLabel = (category) => {
  const map = {
    tuition: '学费',
    rent: '租金',
    sale: '售卖',
    purchase: '采购',
    salary: '工资',
    other: '其他'
  }
  return map[category] || category
}

// ====== 响应式数据 ======
const list = ref([])
const total = ref(0)
const loading = ref(false)

const pagination = reactive({
  pageNum: 1,
  pageSize: 10
})

const searchParams = reactive({
  type: '',
  category: ''
})

const dateRange = ref([])

const dialogVisible = ref(false)
const dialogMode = ref('create')
const currentId = ref(null)

// ====== 计算 startDate / endDate ======
const startDate = computed(() => dateRange.value?.[0] || '')
const endDate = computed(() => dateRange.value?.[1] || '')

// ====== 加载数据 ======
const loadList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      type: searchParams.type || undefined,
      category: searchParams.category || undefined,
      startDate: startDate.value || undefined,
      endDate: endDate.value || undefined
    }
    const res = await getFinancialRecords(params)
    if (res.code === 200) {
      list.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } catch (err) {
    ElMessage.error('加载财务记录失败')
  } finally {
    loading.value = false
  }
}

// ====== 事件处理 ======
const handleSearch = () => {
  pagination.pageNum = 1
  loadList()
}

const handleReset = () => {
  searchParams.type = ''
  searchParams.category = ''
  dateRange.value = []
  pagination.pageNum = 1
  loadList()
}

const handlePageChange = (page) => {
  pagination.pageNum = page
  loadList()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  loadList()
}

const openCreate = () => {
  dialogMode.value = 'create'
  currentId.value = null
  dialogVisible.value = true
}

const openEdit = (row) => {
  dialogMode.value = 'edit'
  currentId.value = row.id
  dialogVisible.value = true
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除此财务记录？', '提示', {
      type: 'warning'
    })
    await deleteFinancialRecord(id)
    ElMessage.success('删除成功')
    loadList()
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 初始化
loadList()
</script>

<style lang="scss" scoped>
.financial-list {
  padding: 20px;
}
</style>