
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
      // children: [
      //   { path: '/article/manage', component: () => import('@/views/article/articleManage.vue') },
      //   { path: '/article/channel', component: () => import('@/views/article/articleChannel.vue') },
      //   { path: '/user/profile', component: () => import('@/views/user/userProfile.vue') },
      //   { path: '/user/avatar', component: () => import('@/views/user/userAvatar.vue') },
      //   { path: '/user/password', component: () => import('@/views/user/userPassword.vue') }
      // ]
    }

  ],
})

export default router
