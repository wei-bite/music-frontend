<!-- src/views/admin/operation/components/FinancialFormDialog.vue -->
<template>
  <el-dialog
    :title="dialogTitle"
    v-model="visible"
    width="600px"
    @closed="handleClose"
    :close-on-click-modal="false"
    :destroy-on-close="true"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      :disabled="isViewMode"
    >
      <!-- 类型 -->
      <el-form-item label="记录类型" prop="type">
        <el-radio-group v-model="form.type">
          <el-radio label="income">收入</el-radio>
          <el-radio label="expense">支出</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 分类 -->
      <el-form-item label="分类" prop="category">
        <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
          <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <!-- 金额 -->
      <el-form-item label="金额" prop="amount">
        <el-input-number
          v-model="form.amount"
          :min="0.01"
          :precision="2"
          :step="100"
          style="width: 100%"
        />
      </el-form-item>

      <!-- 记录日期 -->
      <el-form-item label="记录日期" prop="recordDate">
        <el-date-picker
          v-model="form.recordDate"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>

      <!-- 描述 -->
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入描述（如：学生张三学费）"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button
        v-if="!isViewMode"
        type="primary"
        :loading="submitting"
        @click="handleSubmit"
      >
        {{ mode === 'create' ? '创建' : '更新' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, nextTick, computed } from 'vue'
import { ElMessage } from 'element-plus'

// ✅ 修正：去掉 Service 后缀
import {
  createFinancialRecord,
  updateFinancialRecord,
  getFinancialRecordDetail
} from '@/api/admin/operation'

const props = defineProps({
  modelValue: Boolean,
  mode: {
    type: String,
    default: 'create',
    validator: (val) => ['create', 'edit', 'view'].includes(val)
  },
  recordId: [Number, String]
})

const emit = defineEmits(['update:modelValue', 'success'])

// ====== 响应式状态 ======
const visible = ref(false)
const submitting = ref(false)
const formRef = ref(null)

const form = reactive({
  type: 'income',
  category: '',
  amount: null,
  recordDate: '',
  description: ''
})

// ====== 分类选项 ======
const allCategories = [
  { value: 'tuition', label: '学费', types: ['income'] },
  { value: 'rent', label: '租金', types: ['income'] },
  { value: 'sale', label: '售卖', types: ['income'] },
  { value: 'purchase', label: '采购', types: ['expense'] },
  { value: 'salary', label: '工资', types: ['expense'] },
  { value: 'other', label: '其他', types: ['income', 'expense'] }
]

const categoryOptions = computed(() => {
  return allCategories.filter(item =>
    item.types.includes(form.type) || item.value === 'other'
  )
})

// ====== 响应式计算 ======
const isViewMode = computed(() => props.mode === 'view')
const dialogTitle = computed(() => {
  const map = {
    create: '新增财务记录',
    edit: '编辑财务记录',
    view: '财务记录详情'
  }
  return map[props.mode] || '财务记录'
})

// ====== 校验规则 ======
const rules = {
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
  recordDate: [{ required: true, message: '请选择日期', trigger: 'change' }],
  description: [{ required: true, message: '请输入描述', trigger: 'blur' }]
}

// ====== 加载详情 ======
const loadDetail = async () => {
  if (props.mode === 'create') return

  try {
    const res = await getFinancialRecordDetail(props.recordId)
    if (res.code === 200) {
      const data = res.data
      Object.assign(form, {
        type: data.type || 'income',
        category: data.category || '',
        amount: data.amount || null,
        recordDate: data.recordDate || '',
        description: data.description || ''
      })
    }
  } catch (err) {
    ElMessage.error('加载详情失败')
    visible.value = false
  }
}

// ====== 提交 ======
const handleSubmit = async () => {
  if (isViewMode.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    const payload = {
      type: form.type,
      category: form.category,
      amount: form.amount,
      recordDate: form.recordDate,
      description: form.description,
      relatedId: null
    }

    const apiCall =
      props.mode === 'create'
        ? createFinancialRecord(payload)
        : updateFinancialRecord(props.recordId, payload)

    const res = await apiCall
    if (res.code === 200) {
      ElMessage.success(res.msg || (props.mode === 'create' ? '创建成功' : '更新成功'))
      emit('success')
      visible.value = false
    }
  } catch (err) {
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

// ====== 关闭 ======
const handleClose = () => {
  emit('update:modelValue', false)
  nextTick(() => {
    formRef.value?.resetFields()
  })
}

// ====== 监听 ======
watch(
  () => props.modelValue,
  async (val) => {
    visible.value = val
    if (val) {
      Object.assign(form, {
        type: 'income',
        category: '',
        amount: null,
        recordDate: '',
        description: ''
      })
      await loadDetail()
    }
  },
  { immediate: true }
)
</script>