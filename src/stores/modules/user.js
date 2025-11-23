// stores/user.js
import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'

export const useUserStore = defineStore('music-store-user', {
    state: () => ({
        token: '',
        username: '',
        role: '',
        name: '',
        avatar: '',
        email: '',
        phone: '',
        address: '',
        gender: ''
    }),
    actions: {
        setToken(token) {
            this.token = token
            if (token) {
                try {
                    const payload = jwtDecode(token)
                    this.username = payload.username || payload.sub || ''
                    this.role = payload.role || ''
                } catch (e) {
                    console.error('Token 解析失败', e)
                }
            } else {
                this.username = ''
                this.role = ''
            }
        },
        removeToken() {
            this.$reset()
        },
        updateUserInfo(data) {
            if (data) {
                const payload = { ...data }
                if (payload.avatar && payload.avatar.startsWith('/files/')) {
                    payload.avatar = 'http://localhost:8080' + payload.avatar
                }
                Object.assign(this.$state, payload)
            }
        }
    },
    persist: true
})