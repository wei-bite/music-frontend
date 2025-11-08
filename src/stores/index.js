import { createPinia } from 'pinia'
import presist from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(presist)

export default pinia

// 利用index作为核心出口统一导出
export * from './modules/user'
export * from './modules/counter'