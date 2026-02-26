<template>
  <div class="instrument-batch-add">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>乐器批量入库</span>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        :disabled="submitting"
      >
        <!-- 型号选择 -->
        <el-form-item label="选择型号" prop="modelId">
          <el-select
            v-model="form.modelId"
            filterable
            placeholder="请选择乐器型号"
            style="width: 100%"
          >
            <el-option
              v-for="item in models"
              :key="item.id"
              :label="`${item.brand} ${item.name}（${getTypeLabel(item.type)}）`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <!-- 入库数量 -->
        <el-form-item label="入库数量" prop="count">
          <el-input-number
            v-model="form.count"
            :min="1"
            :max="999"
            controls-position="right"
            style="width: 200px"
          />
          <span class="tip">每次最多可入库 999 件</span>
        </el-form-item>

        <!-- 备注（可选） -->
        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="2"
            placeholder="例如：采购批次、供应商等（可选）"
          />
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="submitting">
            确认入库
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

// ✅ 只导入 instrument.js 中实际存在的函数
import {
  getInstrumentsService,      // 分页查询，用于加载全量型号
  addInstrumentsService       // 批量入库
} from '@/api/admin/instrument'

// 表单引用
const formRef = ref(null)

// 表单数据
const form = reactive({
  modelId: null,
  count: 1,
  remark: ''
})

// 校验规则
const rules = {
  modelId: [{ required: true, message: '请选择乐器型号', trigger: 'change' }],
  count: [
    { required: true, message: '请输入数量', trigger: 'blur' },
    { type: 'number', min: 1, max: 999, message: '数量应在 1~999 之间', trigger: 'blur' }
  ]
}

// 型号列表
const models = ref([])

// 提交状态
const submitting = ref(false)

// 类型中文映射（与型号管理页保持一致）
const getTypeLabel = (type) => {
  const map = {
    piano: '钢琴',
    guitar: '吉他',
    violin: '小提琴',
    saxophone: '萨克斯'
  }
  return map[type] || type
}

// 加载所有乐器型号（用于下拉选择）
const loadModels = async () => {
  try {
    const res = await getInstrumentsService({
      pageNum: 1,
      pageSize: 9999, // 获取全部型号
      keyword: '',
      type: ''
    })
    if (res.code === 200) {
      // 注意：数据在 records 中
      models.value = res.data.records || []
    }
  } catch (err) {
    ElMessage.error('加载乐器型号失败')
    console.error('加载型号失败:', err)
  }
}

// 提交入库
const submitForm = async () => {
  await formRef.value.validate()
  submitting.value = true
  try {
    // 调用入库接口（只传 modelId 和 count）
    await addInstrumentsService(form.modelId, form.count)
    ElMessage.success('✅ 入库成功！')
    resetForm()
  } catch (err) {
    const msg = err.response?.data?.message || '入库失败，请稍后重试'
    ElMessage.error(msg)
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  form.modelId = null
  form.count = 1
  form.remark = ''
}

// 初始化加载型号
loadModels()
</script>

<style scoped lang="scss">
.instrument-batch-add {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;

  .card-header {
    font-size: 18px;
    font-weight: bold;
  }

  .tip {
    margin-left: 12px;
    color: #999;
    font-size: 13px;
  }
}
</style>