<template>
  <el-drawer
    v-model="visible"
    :title="title || (isEdit ? '编辑' : '新增')"
    size="500px"
    :before-close="handleClose"
    custom-class="generic-form-drawer"
  >
    <el-form ref="formRef" :model="formData" label-width="100px" :rules="formRules">
      <template v-for="field in fields" :key="field.prop">
        <template v-if="!(isEdit === false && field.hiddenInCreate)">
          <el-form-item :label="field.label" :prop="field.prop">
            <!-- Input -->
            <el-input
              v-if="field.type === 'input'"
              v-model="formData[field.prop]"
              :placeholder="field.placeholder || '请输入'"
            />
            <!-- Textarea -->
            <el-input
              v-else-if="field.type === 'textarea'"
              v-model="formData[field.prop]"
              type="textarea"
              :placeholder="field.placeholder || '请输入'"
              :rows="field.rows || 4"
            />
            <!-- Number -->
            <el-input-number
              v-else-if="field.type === 'number'"
              v-model.number="formData[field.prop]"
              :min="field.min"
              :max="field.max"
              :step="field.step || 1"
              style="width: 100%"
            />
            <!-- Select -->
            <el-select
              v-else-if="field.type === 'select'"
              v-model="formData[field.prop]"
              style="width: 100%"
              :placeholder="field.placeholder || '请选择'"
              :clearable="field.clearable !== false"
            >
              <el-option
                v-for="opt in field.options"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
            <!-- Radio -->
            <el-radio-group v-else-if="field.type === 'radio'" v-model="formData[field.prop]">
              <el-radio
                v-for="opt in field.options"
                :key="opt.value"
                :label="opt.value"
              >
                {{ opt.label }}
              </el-radio>
            </el-radio-group>
            <!-- Fallback -->
            <span v-else style="color: red">未知字段类型: {{ field.type }}</span>
          </el-form-item>
        </template>
      </template>

      <el-form-item>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
        <el-button @click="handleClose">取消</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch, computed, nextTick } from 'vue'
import {
  ElDrawer,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElSelect,
  ElOption,
  ElRadioGroup,
  ElRadio,
  ElButton
} from 'element-plus'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  isEdit: { type: Boolean, default: false },
  initialData: { type: Object, default: () => ({}) },
  fields: { type: Array, required: true },
  title: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const formRef = ref()
const visible = ref(false)
const formData = ref({})

const formRules = computed(() => {
  const rules = {}
  props.fields.forEach(field => {
    if (field.rules && !(props.isEdit === false && field.hiddenInCreate)) {
      rules[field.prop] = field.rules
    }
  })
  return rules
})

const initFormData = () => {
  const data = {}
  props.fields.forEach(field => {
    const key = field.prop
    let value
    if (props.isEdit) {
      value = props.initialData[key] ?? field.defaultValue ?? ''
    } else {
      value = field.defaultValue ?? ''
    }
    if (field.type === 'number') {
      value = value === '' ? 0 : Number(value) || 0
    }
    data[key] = value
  })
  formData.value = data
}

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
    if (val) {
      nextTick(() => {
        initFormData()
      })
    }
  },
  { immediate: true }
)

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const handleClose = () => {
  visible.value = false
}

const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      const submitData = { ...formData.value }
      props.fields.forEach(field => {
        if (field.type === 'number') {
          submitData[field.prop] = Number(submitData[field.prop]) || 0
        }
      })
      emit('submit', submitData)
      visible.value = false
    }
  })
}
</script>