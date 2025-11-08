<script setup>
import { User, Lock} from '@element-plus/icons-vue';
</script>
<template>
  <el-row class="login-page">
    <el-col :span="10" :offset="7" class="form">
      <div class="card">
        <!-- 左侧图片区 -->
        <div class="card__left bg"></div>
        <!-- 右侧表单区 -->
        <div class="card__right">
            <!-- 注册相关 -->
          <el-form v-if="isRegister">
            <el-form-item>
              <h1>注册</h1>
            </el-form-item>
            <el-form-item>
              <el-input
                clearable
                placeholder="请输入用户名"
                :prefix-icon="User"
              />
            </el-form-item>
            <el-form-item>
              <el-input
                clearable
                :prefix-icon="Lock"
                type="password"
                show-password
                placeholder="请输入密码"
              />
            </el-form-item>
            <el-form-item>
              <el-input
                :prefix-icon="Lock"
                show-password
                type="password"
                placeholder="请再次输入密码"
              />
            </el-form-item>
            <el-form-item>
              <el-button class="button" type="primary">
                注册
              </el-button>
            </el-form-item>
            <el-form-item class="flex">
              <el-link type="info">
                ← 返回
              </el-link>
            </el-form-item>
          </el-form>

          <!-- 登录相关 -->
          <el-form v-else>
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
              <el-link type="info">
                注册 →
              </el-link>
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
  background: url('@/assets/pexels-bg.jpg') no-repeat center / cover;

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
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    display: flex;
    overflow: hidden;
  }

  .card__left {
    flex: 1;
    background: url('@/assets/logo.png') no-repeat 100% 0% / 240px auto,
    url('@/assets/pexels-bg2.jpg') no-repeat center / cover;
  }

  .card__right {
    flex: 1;
    padding: 40px;
    display: flex;
    flex-direction: column;
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