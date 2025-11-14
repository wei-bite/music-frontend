// src/stores/index.js
import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'

export const useUserStore = defineStore('music-store-user', {
    state: () => ({
        token: '',
        username: '',
        role: ''
    }),
    actions: {
        setToken(token) {
            this.token = token
            if (token) {
                try {
                    const payload = jwtDecode(token)
                    // 👇 改成从 username 字段取
                    this.username = payload.username || payload.sub || ''
                    this.role = payload.role || '' // 或 authorities[0] 等
                } catch (e) {
                    console.error('Token 解析失败', e)
                }
            } else {
                this.username = ''
                this.role = ''
            }
        },
        removeToken() {
            this.token = ''
            this.username = ''
            this.role = ''
        }
    }
}, {
    persist: true
})