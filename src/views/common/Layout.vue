<template>
  <el-container class="layout-container">
    <el-aside width="200px" class="sidebar">
      <div class="logo">
        <img src="@/assets/logo.png" alt="Logo" />
        <span>音乐培训管理系统</span>
      </div>
      <el-menu
        :default-active="$route.path"
        class="el-menu-vertical"
        @select="handleSelect"
        router
      >
        <!-- 管理员菜单 -->
        <template v-if="userStore.role === 'admin'">
          <el-menu-item index="/admin/dashboard">
            <el-icon><House /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <el-sub-menu index="/admin/user">
            <template #title>
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </template>
            <el-menu-item index="/admin/user/list">用户列表</el-menu-item>
            <el-menu-item index="/admin/user/detail">用户详情</el-menu-item>
          </el-sub-menu>
          <el-menu-item index="/admin/course">
            <el-icon><Collection /></el-icon>
            <span>课程管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/schedule">
            <el-icon><Calendar /></el-icon>
            <span>课程安排</span>
          </el-menu-item>
          <el-menu-item index="/admin/instrument">
            <el-icon><Tools /></el-icon>
            <span>乐器管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/room">
            <el-icon><OfficeBuilding /></el-icon>
            <span>琴房管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/announcement">
            <el-icon><Message /></el-icon>
            <span>公告管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/financial">
            <el-icon><DataAnalysis /></el-icon>
            <span>财务管理</span>
          </el-menu-item>
        </template>

        <!--教师菜单 -->
        <template v-if="userStore.role === 'teacher'">
          <el-menu-item index="/teacher/dashboard">
            <el-icon><House /></el-icon>
            <span>工作台</span>
          </el-menu-item>
          <el-menu-item index="/teacher/schedule">
            <el-icon><Calendar /></el-icon>
            <span>我的课表</span>
          </el-menu-item>
          <el-menu-item index="/teacher/attendance">
            <el-icon><Checked /></el-icon>
            <span>考勤管理</span>
          </el-menu-item>
          <el-menu-item index="/teacher/leave">
            <el-icon><Edit /></el-icon>
            <span>请假审批</span>
          </el-menu-item>
          <el-menu-item index="/teacher/score">
            <el-icon><EditPen /></el-icon>
            <span>考试打分</span>
          </el-menu-item>
          <el-menu-item index="/teacher/salary">
            <el-icon><Money /></el-icon>
            <span>工资明细</span>
          </el-menu-item>
          <el-menu-item index="/teacher/reserve">
            <el-icon><Timer /></el-icon>
            <span>琴房预约</span>
          </el-menu-item>
          <el-menu-item index="/teacher/announcement">
            <el-icon><Message /></el-icon>
            <span>公告活动</span>
          </el-menu-item>
        </template>

        <!--学菜单 -->
        <template v-if="userStore.role === 'student'">
          <el-menu-item index="/student/schedule">
            <el-icon><Calendar /></el-icon>
            <span>我的课表</span>
          </el-menu-item>
          <el-menu-item index="/student/exam">
            <el-icon><DataLine /></el-icon>
            <span>我的成绩</span>
          </el-menu-item>
          <el-menu-item index="/student/leave">
            <el-icon><Edit /></el-icon>
            <span>请假申请</span>
          </el-menu-item>
          <el-menu-item index="/student/reserve">
            <el-icon><Timer /></el-icon>
            <span>琴房预约</span>
          </el-menu-item>
          <el-menu-item index="/student/rent">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-jita"></use>
            </svg>
            <span>乐器租借</span>
          </el-menu-item>
          <el-menu-item index="/student/sold">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-jita"></use>
            </svg>
            <span>乐器购买</span>
          </el-menu-item>
          <el-menu-item index="/student/announcement">
            <el-icon><Message /></el-icon>
            <span>公告活动</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="user-info">
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link">
              <el-avatar :src="userStore.avatar" />
              {{ userStore.name }}
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item command="avatar">修改头像</el-dropdown-item>
                <el-dropdown-item command="password">修改密码</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  House,
  User,
  Collection,
  Calendar,
  Tools,
  OfficeBuilding,
  Message,
  DataAnalysis,
  Checked,
  Edit,
  EditPen,
  Money,
  Timer,
  DataLine,
  ArrowDown
} from '@element-plus/icons-vue'
import { userGetInfoService } from '@/api/user'

const userStore = useUserStore()
const router = useRouter()

const handleSelect = (key) => {
  console.log('菜单选择:', key)
}

const handleCommand = async (command) => {
  if (command === 'logout') {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    userStore.removeToken()
    router.push('/login')
    ElMessage.success('退出成功')
  } else {
    router.push(`/user/${command}`)
  }
}

onMounted(async () => {
  try {
    const res = await userGetInfoService()
    userStore.updateUserInfo(res.data)
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
})
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
  background-color: #324157;

  .sidebar {
    background-color: #324157;

    .logo {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
      font-weight: bold;
      border-bottom: 1px solid #4a5b79;

      img {
        height: 32px;
        margin-right: 10px;
      }
    }

    .el-menu {
      border-right: none;
      background-color: #324157;

      :deep(.el-menu-item) {
        color: #bfcbd9;

        &:hover {
          background-color: #4a5b79;
        }

        &.is-active {
          background-color: #409eff;
          color: white;
        }
      }
    }
  }

  .header {
    background-color: white;
    border-bottom: 1px solid #e4e7ed;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 20px;

    .user-info {
      .el-dropdown-link {
        display: flex;
        align-items: center;
        cursor: pointer;
        color: #606266;

        .el-avatar {
          margin-right: 10px;
        }
      }
    }
  }

  .main-content {
    background-color: #f5f7fa;
    padding: 20px;
    overflow-y: auto;
  }

  .icon {
    width: 1em;
    height: 1em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
  }
}
</style>