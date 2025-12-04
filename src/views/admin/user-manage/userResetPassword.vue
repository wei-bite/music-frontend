<script setup>
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { userResetPasswordService, userGetDetailService } from '@/api/user'

// 防抖函数
const debounce = (fn, delay = 500) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

const formData = ref({
  userId: ''
})

const rules = {
  userId: [
    { required: true, message: '请输入用户ID', trigger: 'blur' },
    { type: 'number', message: '用户ID必须是数字', trigger: 'blur' }
  ]
}

const formRef = ref(null)
const loading = ref(false)
const resultMessage = ref('')
const userInfo = ref(null)

// 实时查询用户信息（防抖）
const fetchUserInfo = async () => {
  const id = formData.value.userId
  if (!id || isNaN(id)) {
    userInfo.value = null
    return
  }

  try {
    const res = await userGetDetailService(id)
    if (res.code === 200 && res.data) {
      userInfo.value = res.data
    } else {
      userInfo.value = null
    }
  } catch (error) {
    console.error('查询用户失败:', error)
    userInfo.value = null
  }
}

// 使用防抖包装查询
const debouncedFetchUserInfo = debounce(fetchUserInfo, 500)

// 监听 userId 变化，触发查询
watch(() => formData.value.userId, (newVal) => {
  if (newVal !== '' && !isNaN(newVal)) {
    debouncedFetchUserInfo()
  } else {
    userInfo.value = null
  }
})

// 重置密码
const handleReset = async () => {
  if (!userInfo.value) {
    ElMessage.warning('请先输入有效的用户ID并查询到用户信息')
    return
  }

  const user = userInfo.value

  try {
    await ElMessageBox.confirm(
      `确定要重置用户【${user.username}】（${user.name || '—'}）的密码吗？\n\n重置后密码将变为：123456`,
      '确认重置',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    loading.value = true
    const res = await userResetPasswordService(user.id || formData.value.userId)

    if (res.code === 200) {
      ElMessage.success(res.message || '密码重置成功')

      clearForm()
    } else {
      throw new Error(res.message || '操作失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重置失败:', error)
      ElMessage.error(error.message || '操作失败')
    }
    resultMessage.value = ''
  } finally {
    loading.value = false
  }
}

// 清空表单
const clearForm = () => {
  formData.value.userId = ''
  userInfo.value = null
  resultMessage.value = ''
  formRef.value.resetFields()
}
</script>

<template>
  <div class="reset-password-wrapper">
    <!-- 顶部标题 -->
    <div class="page-header">
      <span class="title">重置密码</span>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <el-card class="reset-password-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <h3>重置用户密码</h3>
          </div>
        </template>

        <div class="form-container">
          <el-form :model="formData" label-width="80px" :rules="rules" ref="formRef">
            <el-form-item label="用户ID" prop="userId">
              <el-input
                v-model.number="formData.userId"
                placeholder="请输入用户ID"
                @input="debouncedFetchUserInfo"
                clearable
              />
            </el-form-item>

            <el-form-item v-if="userInfo" label="用户信息">
              <el-descriptions size="small" :column="1" border>
                <el-descriptions-item label="用户名">{{ userInfo.username }}</el-descriptions-item>
                <el-descriptions-item label="姓名">{{ userInfo.name || '—' }}</el-descriptions-item>
              </el-descriptions>
            </el-form-item>

            <el-form-item v-if="!userInfo && formData.userId" label="">
              <span class="tip error">未找到该用户，请检查ID是否正确</span>
            </el-form-item>

            <el-form-item label="">
              <span class="tip">密码将被重置为默认值：<strong>123456</strong></span>
            </el-form-item>
            

            <el-form-item>
              <el-button type="primary" @click="handleReset" :loading="loading">
                重置密码
              </el-button>
              <el-button @click="clearForm">清空</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.reset-password-wrapper {
  height: 100vh;
  background-color: #ffffff;
  padding: 0;
  animation: card-float 3s ease-in-out infinite;
}

.page-header {
  padding: 20px 30px;
  font-size: 16px;
  color: #333;
  border-bottom: 1px solid #ebeef5;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.main-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(70vh - 10px);
  padding: 0 30px;
  background-color: #ffffff;
  
}

.reset-password-card {
  max-width: 500px;
  width: 100%;
  margin: 0 auto;
  padding: 40px 40px;
  border-radius: 16px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid #ebeef5;
  

  .card-header {
    text-align: center;
    color: #333;
    font-size: 18px;
    font-weight: 600;
    padding-bottom: 20px;
    margin-bottom: 20px;
  }

  .form-container {
    margin-top: 0;
  }

  .el-form-item {
    margin-bottom: 16px;
  }

  .el-input {
    width: 100%;
    border-radius: 8px;
  }

  .tip {
    font-size: 13px;
    color: #666;
    margin-top: 8px;
    display: block;
  }

  .result-message {
    margin-top: 16px;
  }

  .el-button {
    margin-right: 10px;
    padding: 8px 16px;
    font-size: 14px;
    border-radius: 8px;
  }

  .el-button--primary {
    background-color: #409eff;
    border-color: #409eff;
    color: white;
    &:hover {
      background-color: #66b1ff;
    }
  }
}


</style>