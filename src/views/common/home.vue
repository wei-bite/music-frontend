<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import 'element-plus/dist/index.css'
import {
  User,
  Notebook,
  Calendar,
  Message,
  Edit,
  Timer,
  UserFilled,
  SwitchButton,
  CaretBottom,
  Avatar,
  Crop,
  EditPen,
  DataLine
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus';
import { useUserStore } from '@/stores';
import { userGetInfoService } from '@/api/user';


const router = useRouter()
const userStore = useUserStore()

const handleCommand = async (key) => {
  console.log(key);
  
  if (key === 'logout') {
    // 如果不加异步直接先退出在弹出框
    await ElMessageBox.confirm(
    '你确认进行退出么？',
    '温馨提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )

  // 退出操作--> 清除本地数据 （Token + user信息）
    userStore.removeToken()
    router.push('/login')
  } else {
    // 跳转操作
    router.push(`/user/${ key }`)
  }
}

onMounted(async () => {
  try {
    // 调用接口获取用户信息
    const res = await userGetInfoService()
    console.log(res.data);
    
    
    // 将返回的数据存入 store（假设你的 store 有 updateUserInfo 方法）
    userStore.updateUserInfo(res.data)
    
  } catch (error) {
    console.error('主页加载用户信息失败:', error)
    // 可选：跳转回登录页
    // router.push('/login')
  }
})
</script>
<template>
  <div class="common-layout">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="200px">
        <!-- logo区域 -->
        <div class="el-aside__logo"></div>

        <!-- 菜单区域 -->
        <el-menu
          :default-active="$route.path"
          class="el-menu-vertical-demo"
          background-color="#324157"
          text-color="#fff"
          active-text-color="#ffd04b"
          router
        >
          <!-- 管理员菜单 -->
          <template v-if="userStore.role === 'admin'">
            <el-sub-menu index="/user1">
              <template #title>
                <el-icon><User /></el-icon>
                <span>用户管理</span>
              </template>
              <el-menu-item index="/user1/teacher">
                <el-icon><Avatar /></el-icon>
                <span>教师管理</span>
              </el-menu-item>
              <el-menu-item index="/user1/student">
                <el-icon><Avatar /></el-icon>
                <span>学生管理</span>
              </el-menu-item>
            </el-sub-menu>

            
            <el-menu-item index="/course">
              <el-icon><Notebook /></el-icon>
              <span>课程管理</span>
            </el-menu-item>

            <el-menu-item index="/schedule">
              <el-icon><Calendar /></el-icon>
              <span>排课管理</span>
            </el-menu-item>

            <el-sub-menu index="/operation">
              <template #title>
                <el-icon><DataLine /></el-icon>
                <span>运营管理</span>
              </template>
              <el-menu-item index="/operation/income">
                <el-icon><DataLine /></el-icon>
                <span>收入</span>
              </el-menu-item>
              <el-menu-item index="/operation/salary">
                <el-icon><DataLine /></el-icon>
                <span>工资</span>
              </el-menu-item>
            </el-sub-menu>
            
             <el-sub-menu index="/music">
              <template #title>
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#icon-yinle"></use>
                </svg>
                <span>乐器管理</span>
              </template>
              <el-menu-item index="/music/room">
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#icon-gangqin"></use>
                </svg>
                <span>琴房管理</span>
              </el-menu-item>
              <el-menu-item index="/music/rent">
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#icon-jita"></use>
                </svg>
                <span>乐器租借管理</span>
              </el-menu-item>
            </el-sub-menu>

            <el-sub-menu index="announcement">
              <template #title>
                <el-icon><Message /></el-icon>
                <span>公告管理</span>
              </template>
              <el-menu-item index="/announcement/create">
                <el-icon><Edit /></el-icon>
                <span>发布公告</span>
              </el-menu-item>
              <el-menu-item index="/announcement/manage">
                <el-icon><DataLine /></el-icon>
                <span>公告管理</span>
              </el-menu-item>
            </el-sub-menu>
          </template>

          <!-- 老师菜单 -->
          <template v-if="userStore.role === 'teacher'">
            <el-menu-item index="/schedule/teacher">
              <el-icon><Calendar /></el-icon>
              <span>我的课表</span>
            </el-menu-item>

            <el-menu-item index="/study/attendance">
              <el-icon><Notebook /></el-icon>
              <span>考勤记录</span>
            </el-menu-item>

            <el-menu-item index="/salary">
              <el-icon><DataLine /></el-icon>
              <span>工资明细</span>
            </el-menu-item>

            <el-menu-item index="/leave/approve">
              <el-icon><Edit /></el-icon> 
              <span>请假审批</span>
            </el-menu-item>

            <el-menu-item index="/study/score">
              <el-icon><EditPen /></el-icon>
              <span>考试打分</span>
            </el-menu-item>

            <el-menu-item index="/reserve">
              <el-icon><Timer /></el-icon>
              <span>琴房预约</span>
            </el-menu-item>

            <el-menu-item index="/announcement/view">
              <el-icon><Message /></el-icon>
              <span>公告活动</span>
            </el-menu-item>
            
          </template>

          <!-- 学生菜单 -->
          <template v-if="userStore.role === 'student'">
            <el-menu-item index="/schedule/student">
              <el-icon><Calendar /></el-icon>
              <span>我的课表</span>
            </el-menu-item>
            <el-menu-item index="/leave/apply">
              <el-icon><Edit /></el-icon>
              <span>请假申请</span>
            </el-menu-item>
            <el-menu-item index="/reserve">
              <el-icon><Timer /></el-icon>
              <span>琴房预约</span>
            </el-menu-item>
            <el-menu-item index="/music-rent">
              <svg class="icon" aria-hidden="true">
                  <use xlink:href="#icon-jita"></use>
                </svg>
              <span>乐器租借/购买</span>
            </el-menu-item>
            <el-menu-item index="/evaluate">
              <el-icon><EditPen /></el-icon>
              <span>教师评价</span>
            </el-menu-item>
            <el-menu-item index="/announcement/view">
              <el-icon><Message /></el-icon>
              <span>公告活动</span>
            </el-menu-item>
          </template>

          <el-sub-menu index="/user">
          <!-- 多级菜单的标题 - 具名插槽 title-->
          <template #title>
            <el-icon><UserFilled /></el-icon>
            <span>个人中心</span>
          </template>

          <!-- 展开的内容 - 默认插槽 -->
          <el-menu-item index="/user/profile">
            <el-icon><User /></el-icon>
            <span>基本资料</span>
          </el-menu-item>
          <el-menu-item index="/user/avatar">
            <el-icon><Crop /></el-icon>
            <span>更换头像</span>
          </el-menu-item>
          <el-menu-item index="/user/password">
            <el-icon><EditPen /></el-icon>
            <span>重置密码</span>
          </el-menu-item>
        </el-sub-menu>

          <el-menu-item @click="() => handleCommand('logout')">
            <el-icon><SwitchButton /></el-icon>
            <span>退出登录</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-container class="content">
        <el-header>
          <!-- 左边文字区域 -->
          <div>琴行管理系统，欢迎您：<strong>{{ userStore.username }}</strong></div>
          <!-- 右边区域dropdown下拉菜单 -->
           <el-dropdown placement="bottom-end" @command="handleCommand">
              <span class="el-dropdown__box">
                <!-- 用户头像 -->
                <el-avatar :src="userStore.avatar" />
                
                <span style="margin: 0 5px;">{{userStore.name}}</span>
                <!-- 小图标 -->
                <el-icon><CaretBottom /></el-icon>
              </span>

              <!-- 折叠的下拉菜单部分 -->
              <template #dropdown>
                <el-dropdown-menu>
                  <!-- command='标识（与目标路由同名）' -->
                  <el-dropdown-item command="profile" :icon="User"
                    >基本资料</el-dropdown-item
                  >
                  <el-dropdown-item command="avatar" :icon="Crop"
                    >更换头像</el-dropdown-item
                  >
                  <el-dropdown-item command="password" :icon="EditPen"
                    >重置密码</el-dropdown-item
                  >
                  <el-dropdown-item command="logout" :icon="SwitchButton"
                    >退出登录</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
           </el-dropdown>
        </el-header>

        <!-- 主盒子 -->
        <el-main>
          <router-view></router-view>
        </el-main>
        <el-footer>琴行管理系统 © 2025 Created by new</el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<style lang="scss" scoped>
.common-layout {
  height: 100vh;
  background-color: #324157;
  .el-aside {
    background-color: #324157;

    &__logo {
      height: 120px;
      background: url('@/assets/logo.png') no-repeat 0 / 120px auto;
    }
    .el-menu {
      min-height: 50vw;
      border-right: none;
    }
  }
  .content {
    min-height: 50vw;
    background-color: #efefef;
    border-radius: 30px 0 0 30px;
  }

    .el-header {
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .el-dropdown__box {
      display: flex;
      align-items: center;
      .el-icon {
        color: #999;
        margin-right: 10px;
      }

      &:active,
      &:focus {
        outline: none;
      }
    }
  }
  .el-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #666;
  }
  .icon {
  width: 20px;
  height: 20px;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
}

</style>