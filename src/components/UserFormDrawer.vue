<script setup>
import { ref, defineProps, defineEmits, watch, computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  isEdit: { type: Boolean, default: false },
  initialData: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue', 'submit'])


const formRef = ref() // 表单引用（用于验证）
const visible = ref(props.modelValue)
const formData = ref({
  username: '',
  name: '',
  role: '',
  email: '',
  phone: '',
  gender: '男',
  address: ''
})

const formRules = computed(() => {
  const rules = {
    name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
    role: [{ required: true, message: '请选择角色', trigger: 'change' }],
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ],
    phone: [
      { required: true, message: '请输入电话', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
    ],
    gender: [
      { required: true, message: '请选择性别', trigger: 'change' }
  ],
  }
  if (!props.isEdit) {
    rules.username = [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
    ]
  }
  return rules
})

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
    if (val && props.isEdit) {
      // ✅ 双重保险：即使父组件漏了，这里也兜底
      formData.value = {
        username: props.initialData.username || '',
        name: props.initialData.name || '',
        role: props.initialData.role || '',
        email: props.initialData.email || '',
        phone: props.initialData.phone || '',
        gender: props.initialData.gender || '男',
        address: props.initialData.address || ''
      }
    } else if (val) {
      // 新增模式重置
      formData.value = { /* 默认值 */ }
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

// 处理表单提交
const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      //
      emit('submit', { ...formData.value })
      visible.value = false
    }
    // 验证失败时，Element Plus 自动显示错误提示，且不关闭抽屉
  })
}
</script>

<template>
  <el-drawer
    v-model="visible"
    :title="isEdit ? '编辑用户' : '新增用户'"
    size="500px"
    :before-close="handleClose"
    custom-class="user-form-drawer"
  >
    <el-form
      ref="formRef"
      :model="formData"
      label-width="80px"
      class="user-form"
      :rules="formRules"
    >
    <el-form-item 
      v-if="!props.isEdit" 
      label="用户名" 
      prop="username"
    >
      <el-input v-model="formData.username" placeholder="请输入用户名" />
    </el-form-item>
      <el-form-item label="姓名" prop="name">
        <el-input v-model="formData.name" placeholder="请输入姓名" />
      </el-form-item>

      <el-form-item label="角色" prop="role">
        <el-select v-model="formData.role" style="width: 100%" placeholder="请选择角色">
          <el-option label="学生" value="student" />
          <el-option label="老师" value="teacher" />
        </el-select>
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" placeholder="请输入邮箱" />
      </el-form-item>

      <el-form-item label="电话" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入电话" />
      </el-form-item>

      <el-form-item label="性别" prop="gender">
        <el-radio-group v-model="formData.gender">
          <el-radio value="男">男</el-radio>
          <el-radio value="女">女</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="地址" prop="address">
        <el-input
          v-model="formData.address"
          type="textarea"
          :rows="4"
          placeholder="请输入地址"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSubmit"
        >{{ isEdit ? '保存修改' : '创建用户' }}</el-button>
        <el-button @click="handleClose">取消</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>



<style lang="scss" scoped>
.user-form {
  padding: 0 16px;

  .el-form-item {
    margin-bottom: 16px;

    .el-form-item__label {
      font-size: 14px;
      color: #666;
    }

    .el-radio-group {
      display: flex;
      gap: 16px;
    }
  }
}
</style>