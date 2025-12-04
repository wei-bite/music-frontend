
import { useUserStore } from '@/stores'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 一级路由
    { path: '/', redirect: '/layout' },//重定向到首页
    { path: '/login', component: () => import('@/views/common/login.vue') },//登录页
    {
      path: '/layout', component: () => import('@/views/common/Layout.vue'),
      redirect: '/home',
      // 二级路由
      children: [
        { path: '/home', component: () => import('@/views/common/home.vue') },//首页
        // 管理员页面路由
        { path: '/user1/detail', props: true, component: () => import('@/views/admin/user-manage/userDetail.vue') },
        { path: '/user1/list', component: () => import('@/views/admin/user-manage/userListManage.vue') },
        { path: '/user1/reset-password', component: () => import('@/views/admin/user-manage/userResetPassword.vue') },
        { path: '/schedule', component: () => import('@/views/admin/schedule-manage/schedule.vue') },
        { path: '/course', component: () => import('@/views/admin/course-manage/course.vue') },
        { path: '/operation/income', component: () => import('@/views/admin/operation-manage/income.vue') },
        { path: '/operation/salary', component: () => import('@/views/admin/operation-manage/salary.vue') },
        { path: '/music/rent', component: () => import('@/views/admin/music-manage/music-rent.vue') },
        { path: '/music/room', component: () => import('@/views/admin/music-manage/room.vue') },
        { path: '/announcement/create', component: () => import('@/views/admin/announcement-manage/create.vue') },
        { path: '/announcement/manage', component: () => import('@/views/admin/announcement-manage/manage.vue') },
        // 老师页面路由
        { path: '/schedule/teacher', component: () => import('@/views/teacher/schedule-my.vue') },
        { path: '/study/attendance', component: () => import('@/views/teacher/study-record/attendance.vue') },
        { path: '/study/score', component: () => import('@/views/teacher/study-record/score.vue') },
        { path: '/salary', component: () => import('@/views/teacher/salary-my.vue') },
        { path: '/leave/approve', component: () => import('@/views/teacher/leave-approve.vue') },

        //学生页面路由
        { path: '/leave/apply', component: () => import('@/views/student/leave-approve.vue') },
        { path: '/schedule/student', component: () => import('@/views/student/schedule-my.vue') },
        { path: '/music-rent', component: () => import('@/views/student/music-rent.vue') },
        { path: '/evaluate', component: () => import('@/views/student/evaluate.vue') },

        // 公共页面路由
        { path: '/reserve', component: () => import('@/views/teacher/reserve.vue') },
        { path: '/announcement/view', component: () => import('@/views/teacher/announcement.vue') },
        { path: '/user/profile', component: () => import('@/views/common/userProfile.vue') },
        { path: '/user/avatar', component: () => import('@/views/common/userAvatar.vue') },
        { path: '/user/password', component: () => import('@/views/common/userPassword.vue') },
      ]
    }

  ],
})

// 辅助函数：判断 JWT 是否过期
function isTokenExpired(token) {
  if (!token) return true
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp * 1000 // JWT 的 exp 是秒级时间戳
    return Date.now() > exp
  } catch (e) {
    return true // 解析失败也视为无效
  }
}

// 导航守卫
router.beforeEach((to, from) => {
  const userStore = useUserStore()
  const token = userStore.token

  // 如果访问的是非登录页，且 token 不存在或已过期
  if (to.path !== '/login') {
    if (!token || isTokenExpired(token)) {
      return '/login'
    }
  }

  return true
})

export default router
