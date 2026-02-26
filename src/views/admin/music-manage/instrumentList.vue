<template>
  <GenericListAssistant
    title="乐器型号管理"
    :columns="columns"
    :searchFields="searchFields"
    :list="tableData"
    :total="total"
    :loading="loading"
    :pagination="pagination"
    :searchParams="searchParams"
    :showViewBtn="false"
    @search="loadData"
    @reset="resetSearch"
    @page-change="handlePageChange"
    @size-change="handleSizeChange"
    @create="handleCreate"
    @edit="handleEdit"
    @delete="handleDelete"
  >
    <!-- 类型列 -->
    <template #col-type="{ row }">
      {{ getTypeLabel(row.type) }}
    </template>

    <!-- 售价列 -->
    <template #col-salePrice="{ row }">
      ¥{{ row.salePrice?.toFixed(2) }}
    </template>

    <!-- 日租金列 -->
    <template #col-rentPricePerDay="{ row }">
      ¥{{ row.rentPricePerDay?.toFixed(2) }}
    </template>

    <!-- 操作列（仅保留库存统计） -->
    <template #default="{ row }">
      <el-button size="small" @click="handleViewStats(row)">库存统计</el-button>
    </template>
  </GenericListAssistant>

  <!-- 新增/编辑弹窗 -->
  <el-dialog
    :title="dialogTitle"
    v-model="dialogVisible"
    width="500px"
    @closed="resetForm"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      status-icon
    >
      <el-form-item label="型号名称" prop="name">
        <el-input v-model.trim="form.name" placeholder="请输入型号名称" />
      </el-form-item>

      <el-form-item label="乐器类型" prop="type">
        <el-select
          v-model="form.type"
          placeholder="请选择或输入类型"
          style="width: 100%"
          filterable
          allow-create
          default-first-option
          :reserve-keyword="false"
        >
          <el-option
            v-for="opt in typeOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
        <div class="type-tip">提示：可输入新类型，如“竖琴”、“电子鼓”</div>
      </el-form-item>

      <el-form-item label="品牌" prop="brand">
        <el-input v-model.trim="form.brand" placeholder="请输入品牌" />
      </el-form-item>

      <el-form-item label="描述">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="描述（可选）"
        />
      </el-form-item>

      <el-form-item label="售价(元)" prop="salePrice">
        <el-input-number
          v-model="form.salePrice"
          :min="0.01"
          :precision="2"
          :step="0.01"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="日租金(元)" prop="rentPricePerDay">
        <el-input-number
          v-model="form.rentPricePerDay"
          :min="0.01"
          :precision="2"
          :step="0.01"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
    </template>
  </el-dialog>

  <!-- 库存统计弹窗 -->
  <el-dialog v-model="statsDialogVisible" title="库存统计" width="400px">
    <el-descriptions :column="1" border>
      <el-descriptions-item label="总进货数量">{{ stats.totalIn }}</el-descriptions-item>
      <el-descriptions-item label="可用数量">{{ stats.available }}</el-descriptions-item>
      <el-descriptions-item label="租出数量">{{ stats.rented }}</el-descriptions-item>
      <el-descriptions-item label="售出数量">{{ stats.sold }}</el-descriptions-item>
      <el-descriptions-item label="报废数量">{{ stats.retired }}</el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import GenericListAssistant from '@/components/GenericListManager.vue'

import {
  getInstrumentsService,
  createInstrumentModelService,
  updateInstrumentModelService,
  deleteInstrumentModelService,
  getInstrumentStatsService,
  getInstrumentTypesService
} from '@/api/admin/instrument'

// === 动态类型选项（用于下拉建议）===
const rawTypes = ref([])

const typeOptions = computed(() => {
  return rawTypes.value.map(type => ({
    value: type,
    label: type
  }))
})

const searchFields = computed(() => [
  {
    prop: 'type',
    label: '类型',
    type: 'select',
    placeholder: '请选择类型',
    options: typeOptions.value
  },
  {
    prop: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: '型号或品牌'
  }
])

const columns = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '型号名称', minWidth: '160' },
  { prop: 'type', label: '类型', width: 100 },
  { prop: 'brand', label: '品牌', minWidth: '100' },
  { prop: 'salePrice', label: '售价(元)', width: 100 },
  { prop: 'rentPricePerDay', label: '日租金(元)', width: 110 },
  { prop: 'availableStock', label: '可用库存', width: 90 }
]

// === 数据状态 ===
const tableData = ref([])
const total = ref(0)
const loading = ref(false)

const pagination = reactive({
  page: 1,
  size: 10
})

const searchParams = reactive({
  type: '',
  keyword: ''
})

// === 弹窗状态 ===
const dialogVisible = ref(false)
const statsDialogVisible = ref(false)

// === 表单数据 ===
const formRef = ref(null)
const form = reactive({
  name: '',
  type: '',
  brand: '',
  description: '',
  salePrice: null,
  rentPricePerDay: null
})
const rules = {
  name: [{ required: true, message: '请输入型号名称', trigger: 'blur' }],
  type: [{ required: true, message: '请输入或选择乐器类型', trigger: 'change' }],
  brand: [{ required: true, message: '请输入品牌', trigger: 'blur' }],
  salePrice: [{ required: true, message: '请输入售价', trigger: 'blur' }],
  rentPricePerDay: [{ required: true, message: '请输入日租金', trigger: 'blur' }]
}

const stats = reactive({
  totalIn: 0,
  available: 0,
  rented: 0,
  sold: 0,
  retired: 0
})

// === 工具函数 ===
const getTypeLabel = (type) => {
  // 如果后端已统一用中文，可直接返回 type
  // 这里保留映射是为了兼容旧数据（如 piano → 钢琴）
  const map = {
    piano: '钢琴',
    guitar: '吉他',
    violin: '小提琴',
    saxophone: '萨克斯'
  }
  return map[type] || type
}

// === 加载类型（用于下拉建议）===
const loadTypes = async () => {
  try {
    const res = await getInstrumentTypesService()
    if (res.code === 200 && Array.isArray(res.data)) {
      rawTypes.value = res.data
    }
  } catch (err) {
    ElMessage.error('加载乐器类型失败')
  }
}

// === 加载列表 ===
const loadData = async () => {
  loading.value = true
  try {
    const res = await getInstrumentsService({
      pageNum: pagination.page,
      pageSize: pagination.size,
      type: searchParams.type || undefined,
      keyword: searchParams.keyword || undefined
    })
    if (res.code === 200) {
      tableData.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } catch (err) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

// === 操作方法 ===
const resetSearch = () => {
  searchParams.type = ''
  searchParams.keyword = ''
  loadData()
}

const handlePageChange = (page) => {
  pagination.page = page
  loadData()
}

const handleSizeChange = (size) => {
  pagination.size = size
  loadData()
}

const handleCreate = () => {
  currentModelId = null
  Object.keys(form).forEach(key => {
    form[key] = key === 'description' ? '' : null
  })
  dialogVisible.value = true
  loadTypes() // 确保弹窗打开时类型是最新的
}

const handleEdit = (row) => {
  currentModelId = row.id
  Object.assign(form, {
    name: row.name,
    type: row.type,
    brand: row.brand,
    description: row.description || '',
    salePrice: row.salePrice,
    rentPricePerDay: row.rentPricePerDay
  })
  dialogVisible.value = true
}

const handleDelete = async (id) => {
  try {
    await deleteInstrumentModelService(id)
    ElMessage.success('删除成功')
    loadData()
  } catch (err) {
    ElMessage.error(err.response?.data?.message || '删除失败')
  }
}

let currentModelId = null

const submitting = ref(false)
const submitForm = async () => {
  await formRef.value.validate()
  submitting.value = true
  try {
    if (currentModelId) {
      await updateInstrumentModelService(currentModelId, form)
      ElMessage.success('更新成功')
    } else {
      await createInstrumentModelService(form)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadData()
    loadTypes() // 创建新类型后，刷新类型列表
  } catch (err) {
    ElMessage.error(err.response?.data?.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  formRef.value?.resetFields()
}

const handleViewStats = async (row) => {
  try {
    const res = await getInstrumentStatsService(row.id)
    if (res.code === 200) {
      Object.assign(stats, res.data)
      statsDialogVisible.value = true
    }
  } catch (err) {
    ElMessage.error('获取统计失败')
  }
}

// === 初始化 ===
onMounted(() => {
  loadTypes()
  loadData()
})

const dialogTitle = computed(() => {
  return currentModelId ? '编辑型号' : '新增型号'
})
</script>

<style scoped lang="scss">
.type-tip {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
</style>