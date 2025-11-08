
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 一级路由
    { path: '/', redirect: '/home' },//重定向到首页
    { path: '/login', component: () => import('@/views/common/login.vue') },//登录页
    {
      path: '/home', component: () => import('@/views/common/home.vue'),
      // 二级路由
      children: [
        // 管理员页面路由
        { path: '/user/teacher', component: () => import('@/views/admin/user-manage/teacher.vue') },
        { path: '/user/student', component: () => import('@/views/admin/user-manage/student.vue') },
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

// 导航守卫
// router.beforeEach((to, from) => {
//   // 如果没有Token，且访问的是非登录页，拦截到登录，其他情况正常放行
//   const useStore = useUserStore()
//   if (!useStore.token && to.path !== '/login') {
//     return '/login'
//   }
// })

export default router
