<script setup>
import { User, Lock} from '@element-plus/icons-vue';
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
          <el-form>
            <el-form-item>
              <h1>登录</h1>
            </el-form-item>
            <el-form-item>
              <el-input
                clearable 
                :prefix-icon="User"
                placeholder="请输入用户名"
              />
            </el-form-item>
            <el-form-item>
              <el-input
                :prefix-icon="Lock"
                show-password
                type="password"
                name="password"
                placeholder="请输入密码"
              />
            </el-form-item>
            <el-form-item class="flex">
              <div class="flex">
                <el-checkbox>记住我</el-checkbox>
                <el-link type="primary">忘记密码？</el-link>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button class="button" type="primary">
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

  .button {
    width: 100%;
  }
}
</style>