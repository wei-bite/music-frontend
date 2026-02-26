
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
        {
          path: '/schedule/list',
          component: () => import('@/views/admin/schedule-manage/scheduleList.vue')
        },
        {
          path: '/schedule/detail/:id',
          name: 'ScheduleDetail',
          component: () => import('@/views/admin/schedule-manage/scheduleDetail.vue'),
          props: true
        },
        {
          path: '/schedule/form',
          name: 'ScheduleForm',
          component: () => import('@/views/admin/schedule-manage/scheduleForm.vue')
          // 通过 query.mode 区分 create/edit
        },
        {
          path: '/schedule/batch',
          name: 'BatchScheduleForm',
          component: () => import('@/views/admin/schedule-manage/scheduleBatch.vue')
          // 独立批量页面
        },
        { path: '/course/list', component: () => import('@/views/admin/course-manage/courseListManage.vue') },
        { path: '/course/detail', component: () => import('@/views/admin/course-manage/courseDetail.vue') },
        { path: '/course/recover', component: () => import('@/views/admin/course-manage/courseRecover.vue') },
        { path: '/operation/income', component: () => import('@/views/admin/operation-manage/FinancialList.vue') },
        { path: '/operation/salary', component: () => import('@/views/admin/operation-manage/FinancialReport.vue') },
        { path: '/operation/salaryList', component: () => import('@/views/admin/operation-manage/salaryList.vue') },
        { path: '/music/rent', component: () => import('@/views/admin/music-manage/instrumentRentalList.vue') },
        { path: '/music/room/list', component: () => import('@/views/admin/music-manage/roomList.vue') },
        { path: '/music/room/pendingList', component: () => import('@/views/admin/music-manage/PendingReservationList.vue') },
        { path: '/music/instrument/list', component: () => import('@/views/admin/music-manage/instrumentList.vue') },
        { path: '/music/instrument/batch', component: () => import('@/views/admin/music-manage/instrumentBatch.vue') },
        { path: '/music/rented', component: () => import('@/views/admin/music-manage/RentedInstrumentsList.vue') },
        { path: '/music/sold', component: () => import('@/views/admin/music-manage/SoldInstrumentsList.vue') },
        { path: '/announcement/manage', component: () => import('@/views/admin/announcement-manage/announcementList.vue') },
        // 老师页面路由
        { path: '/teacher/schedule', component: () => import('@/views/teacher/schedule-my.vue') },
        { path: '/teacher/attendance', component: () => import('@/views/teacher/attendance.vue') },
        { path: '/teacher/score', component: () => import('@/views/teacher/score.vue') },
        { path: '/teacher/salary', component: () => import('@/views/teacher/salary-my.vue') },
        { path: '/teacher/leave', component: () => import('@/views/teacher/leave-approve.vue') },
        { path: '/teacher/reserve', component: () => import('@/views/teacher/reserve.vue') },
        { path: '/teacher/announcement', component: () => import('@/views/teacher/announcement.vue') },

        //学生页面路由
        { path: '/student/leave', component: () => import('@/views/student/leave-approve.vue') },
        { path: '/student/schedule', component: () => import('@/views/student/schedule-my.vue') },
        { path: '/student/exam', component: () => import('@/views/student/exam-scores.vue') },
        { path: '/student/evaluate', component: () => import('@/views/student/evaluate.vue') },
        { path: '/student/reserve', component: () => import('@/views/student/reserve.vue') },
        { path: '/student/announcement', component: () => import('@/views/student/announcement.vue') },
        { path: '/student/rent', component: () => import('@/views/student/instrumentRent.vue') },
        { path: '/student/sold', component: () => import('@/views/student/instrumentSold.vue') },
        // 公共页面路由
        { path: '/user/profile', component: () => import('@/views/common/userProfile.vue') },
        { path: '/user/avatar', component: () => import('@/views/common/userAvatar.vue') },
        { path: '/user/password', component: () => import('@/views/common/userPassword.vue') },
        // 为了兼容不同角色的访问需求，保留特定页面路由
        { path: '/common/reserve', component: () => import('@/views/student/reserve.vue') },
        { path: '/common/announcement', component: () => import('@/views/student/announcement.vue') },
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
