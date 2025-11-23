<script setup>
import { useUserStore } from '@/stores'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { userUpdateInfoService } from '@/api/user'

const userStore = useUserStore()
const drawerVisible = ref(false)
const formRef = ref(null)
const formData = ref({})

const rules = {
  name: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度在2到10个字符之间', trigger: 'blur' }
  ],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }], // 👈 trigger 改为 change
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  address: [{ required: true, message: '请输入联系地址', trigger: 'blur' }]
}

const editProfile = () => {
  formData.value = {
    name: userStore.name || '',
    gender: userStore.gender || '',
    email: userStore.email || '',
    phone: userStore.phone || '',
    address: userStore.address || ''
  }
  drawerVisible.value = true
}

const cancel = () => {
  drawerVisible.value = false
}

const submitForm = async () => {
  try {
    await formRef.value?.validate()

    const data = { ...formData.value }

    if (Object.keys(data).length === 0) {
      ElMessage.warning('请至少修改一个字段')
      return
    }

    const res = await userUpdateInfoService(data)
    
    ElMessage.success('资料更新成功')
    userStore.updateUserInfo(data)

    drawerVisible.value = false
  } catch (error) {
    console.error('提交失败:', error)
    const msg = error.response?.data?.message || '保存失败，请稍后重试'
    ElMessage.error(msg)
  }
}
</script>

<template>
  <PageContainer title="个人基本资料">
    <template #extra>
      <el-button type="primary" @click="editProfile">编辑资料</el-button>
    </template>

    <div class="profile-content">
      <div class="avatar-section">
        <el-avatar :size="80" :src="userStore.avatar || ''" />
        <h2 class="username">{{ userStore.name || userStore.username }}</h2>
        <p class="role">角色：{{ userStore.role }}</p>
      </div>

      <el-divider />

      <el-descriptions :column="1" border size="large" class="info-section">
        <el-descriptions-item label="用户名">
          {{ userStore.username || '—' }}
        </el-descriptions-item>
        <el-descriptions-item label="真实姓名">
          {{ userStore.name || '—' }}
        </el-descriptions-item>
        <el-descriptions-item label="电子邮箱">
          {{ userStore.email || '—' }}
        </el-descriptions-item>
        <el-descriptions-item label="手机号码">
          {{ userStore.phone || '—' }}
        </el-descriptions-item>
        <el-descriptions-item label="联系地址">
          {{ userStore.address || '—' }}
        </el-descriptions-item>
        <el-descriptions-item label="账户状态">
          <el-tag type="success">正常</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <el-drawer
      v-model="drawerVisible"
      title="编辑个人资料"
      :with-header="true"
      size="500px"
      direction="rtl"
    >
      <el-form
        :model="formData"
        label-width="100px"
        :rules="rules"
        ref="formRef"
        style="padding-right: 20px"
      >
        <el-form-item label="真实姓名" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="formData.gender" placeholder="请选择性别">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>
        <el-form-item label="电子邮箱" prop="email">
          <el-input v-model="formData.email" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="formData.phone" />
        </el-form-item>
        <el-form-item label="联系地址" prop="address">
          <el-input v-model="formData.address" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="submitForm">保存</el-button>
        </span>
      </template>
    </el-drawer>
  </PageContainer>
</template>

<style lang="scss" scoped>
.profile-content {
  padding: 20px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.avatar-section .username {
  margin: 12px 0 6px;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.avatar-section .role {
  color: #666;
  font-size: 14px;
}

.info-section :deep(.el-descriptions__body) {
  background-color: #fafafa;
}

.el-drawer__body {
  padding: 20px;
}

.dialog-footer {
  text-align: right;
  margin-top: 20px;
}
</style>