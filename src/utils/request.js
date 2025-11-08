import axios from 'axios'
import { useUserStore } from '@/stores'
import { ElMessage } from 'element-plus'
import router from '@/router'

const baseURL = ''

const instance = axios.create({
  baseURL,
  timeout: 10000
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    const UserStore = useUserStore()
    if (UserStore.token) {
      // 确保 token 是有效的字符串
      let token = UserStore.token

      // 移除可能的非法字符
      token = token.replace(/[^\x00-\x7F]/g, '') // 移除非 ASCII 字符
      token = token.trim() // 移除首尾空格

      // 检查 token 是否有效
      if (token && token.length > 0) {
        config.headers.Authorization = token
      } else {
        console.warn('无效的 token，已跳过设置')
      }
    }
    return config
  },
  (err) => Promise.reject(err)
)

// 响应拦截器
instance.interceptors.response.use(
  (res) => {
    if (res.data.code === 0) {
      return res.data
    }
    ElMessage.error(res.data.message || '服务异常')
    return Promise.reject(res.data)
  },
  (err) => {
    console.error('响应错误详情:', err)

    // 安全地处理错误信息
    let errorMessage = '服务异常'

    if (err.response?.status === 401) {
      router.push('/login')
      errorMessage = '登录已过期，请重新登录'
    } else if (err.response?.data?.message) {
      errorMessage = err.response.data.message
    } else if (err.message) {
      errorMessage = err.message
    }

    ElMessage.error(errorMessage)
    return Promise.reject(err)
  }
)

export default instance
// 导出基地址
export { baseURL }