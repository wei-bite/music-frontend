<script setup>
import { User, Lock} from '@element-plus/icons-vue';
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import 'element-plus/dist/index.css' // 必须引入样式文件
import { userLoginService } from '@/api/user';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/index';
import { jwtDecode } from 'jwt-decode'

const isRegister = ref(false)
const form = ref()
//注册
// 整个用于提交的form数据对象
const formModel = ref({
  username:'',
  password:'',
  role: 'admin' // 默认选中管理员
})

// 整个表单的校验规则
const rules = {
  username: [
    // required: true,非空校验，message: 信息提示 ，trigger: 'blur'失焦时触发
    { required: true, message: 'Please input Activity name', trigger: 'blur' },
    //长度校验
    { min: 3, max: 16, message: 'Length should be 3 to 16', trigger: 'blur' },
    
  ],
  password: [
    { required: true, message: 'Please input Activity password', trigger: 'blur' },
    // 正则校验pattern: 
    { pattern: /^\S{3,16}$/, message: '密码必须是3-16位的 非空字符', trigger: 'blur' }
  ],
  role: [
     { required: true, message: '请选择身份', trigger: 'change' }// 单选框通常用 change 触发校
  ]
}

// 登入按钮实现
const userStore = useUserStore()//用来接收Token，方便使用Pinia持久化
const router = useRouter()

const login = async () => {
  try {
    console.log('登录按钮被点击') // 添加日志，确认按钮是否被点击
    
    // 表单验证
    await form.value.validate()
    console.log('表单验证通过')
    
    // 调用登录接口
    const res = await userLoginService(formModel.value)
    console.log(res); 
    userStore.setToken(res.data.token)//接收Token
    console.log('JWT Payload:', jwtDecode(res.data.token))
    
    
    // 登录成功
    ElMessage.success('登录成功')
    router.push('/home')
    
  } catch (error) {
    console.log('登录过程中出错:', error)
    // 如果是验证错误，Element Plus 会自动显示错误信息
    // 如果是API错误，显示后端返回的错误信息
    if (error.response) {
      ElMessage.error(error.response.data?.message || '登录失败')
    }
  }
}

</script>
<template>
  <el-row class="login-page">
    <div class="bear"></div>
    <el-col :span="10" :offset="7" class="form">
      <div class="card">
        <!-- 左侧图片区 -->
        <div class="card__left bg"></div>
        <!-- 右侧表单区 -->
        <div class="card__right">
          <!-- 登录相关 -->
          <el-form :model="formModel" :rules="rules" ref="form">
            <el-form-item>
              <h1>登录</h1>
            </el-form-item>

            <el-form-item prop="username">
              <el-input
                v-model="formModel.username"
                clearable 
                :prefix-icon="User"
                placeholder="请输入用户名"
              />
            </el-form-item>

            <el-form-item prop="password">
              <el-input
               v-model="formModel.password"
                :prefix-icon="Lock"
                show-password
                type="password"
                name="password"
                placeholder="请输入密码"
                @keyup.enter="login"
              />
            </el-form-item>

            <!-- 身份选择 -->
            <el-form-item prop="role" class="role-radio-group">
              <el-radio-group v-model="formModel.role">
                <el-radio  label="admin">管理员</el-radio>
                <el-radio  label="teacher">老师</el-radio>
                <el-radio  label="student">学生</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item class="flex">
              <div class="flex">
                <el-checkbox>记住我</el-checkbox>
                <el-link type="primary">忘记密码？</el-link>
              </div>
            </el-form-item>


            <el-form-item>
              <el-button @click="login" class="button" type="primary">
                登录
              </el-button>
            </el-form-item>
            <el-form-item class="flex">
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
.login-page {
  height: 100vh;
  background: url('@/assets/pexels-pixabay.jpg') no-repeat center / cover;

  .bear {
    position: absolute;
    bottom: 80px;
    width: 200px;
    height: 100px;
    background: url('@/assets/bear.png') no-repeat;
    animation: bear .4s steps(8) infinite, move 3s forwards;
  }

  @keyframes bear {
    0% {
        background-position: 0 0;
    }
    100% {
        background-position: -1600px 0;
    }
  }
        
  @keyframes move {
    0% {
        left: 0;
    }
    100% {
        left: 50%;
        /* margin-left: -100px; */
        transform: translateX(-50%);
    }
  }

  .form {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .card {
    width: 100%;
    min-height: 50vh;
    max-height: 70vh;
    background-color: #fff;
    box-shadow: 0px 0px 50px 0px rgba(0,0,0,0.1),
    0px 0px 48px -3px rgba(0,0,0,0.1),
    0px 10px 15px -3px rgba(0,0,0,0.1);
    border-radius: 2rem;
    display: flex;
    overflow: hidden;
  }

  .card__left {
    flex: 1;
    background: url('@/assets/file.jpeg') no-repeat center / cover;
  }

  .card__right {
    flex: 1;
    padding: 80px 40px 20px;
    display: flex;
    flex-direction: column;
    background: url('@/assets/logo.png') no-repeat 100% 0% / 120px auto;
  }

  h1 {
    text-align: center;
    margin-bottom: 30px;
  }

  .flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

.role-radio-group {
  display: flex;
  flex-direction: column;
  gap: 12px; // 每个 radio 之间间隔
  margin-bottom: 20px;

  :deep(.el-form-item__label) {
    font-weight: bold;
    margin-bottom: 8px;
  }

  :deep(.el-radio__label) {
    font-size: 16px;
  }
}

  .button {
    width: 100%;
  }
}
</style>