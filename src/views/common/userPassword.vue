<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { userUpdatePasswordService } from '@/api/user'
import { useUserStore } from '@/stores'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()
const formRef = ref(null)
const formModel = ref({
  old_pwd: '',
  new_pwd: '',
  re_pwd: ''
})

// 表单验证规则
const rules = {
  old_pwd: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  new_pwd: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 3, message: '密码长度至少为3位', trigger: 'blur' }
  ],
  re_pwd: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value) => {
        if (value !== formModel.value.new_pwd) {
          return Promise.reject('两次输入的新密码不一致')
        }
        return Promise.resolve()
      }, trigger: 'blur'
    }
  ]
}

// 提交表单
const submitForm = async () => {
  try {
    // 使用 Promise 方式验证表单
    await formRef.value.validate()

    // 验证通过，调用 API
    await userUpdatePasswordService(formModel.value)

    ElMessage.success('密码修改成功！')
    resetForm()
    // 退出操作--> 清除本地数据 （Token + user信息）
    userStore.removeToken()
    router.push('/login')
  } catch (error) {
    // 表单验证失败 或 API 请求失败 都会进入这里
    if (error?.response) {
      // API 错误
      ElMessage.error(error.response.data?.message || '密码修改失败，请重试。')
    } else {
      // 表单验证失败（Element Plus 抛出的错误）
      console.warn('表单验证未通过')
      // 通常不需要提示，Element Plus 已在字段下方显示错误
    }
  }
}

// 重置表单
const resetForm = () => {
  formRef.value.resetFields()
}
</script>

<template>
  <page-container title="重置密码">
    <el-card class="reset-password-container">
      <el-form :model="formModel" :rules="rules" ref="formRef" label-width="100px" label-position="left">
        <!-- 当前密码 -->
        <el-form-item label="当前密码" prop="old_pwd">
          <el-input type="password" v-model="formModel.old_pwd" autocomplete="off" placeholder="请输入当前密码" />
        </el-form-item>

        <!-- 新密码 -->
        <el-form-item label="新密码" prop="new_pwd">
          <el-input type="password" v-model="formModel.new_pwd" autocomplete="off" placeholder="请输入新密码" />
        </el-form-item>

        <!-- 确认新密码 -->
        <el-form-item label="确认新密码" prop="re_pwd">
          <el-input type="password" v-model="formModel.re_pwd" autocomplete="off" placeholder="请再次输入新密码" />
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <div class="button-group">
            <el-button @click="resetForm">取消</el-button>
            <el-button type="primary" @click="submitForm">提交</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </page-container>
</template>



<style lang="scss" scoped>
.reset-password-container {
  max-width: 450px;
  margin: 60px auto;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background-color: #fff;

  .el-form {
    .el-form-item {
      margin-bottom: 24px;
    }

    .el-form-item__label {
      font-weight: 500;
      color: #333;
    }

    .el-input {
      width: 100%;
      border-radius: 6px;
    }

    .button-group {
      display: flex;
      gap: 12px;
      justify-content: center;
      align-items: center;
    }

    .el-button {
      padding: 10px 24px;
      font-size: 14px;
      border-radius: 6px;
      &:not(:last-child) {
        margin-right: 12px;
      }
    }
  }
}
</style>