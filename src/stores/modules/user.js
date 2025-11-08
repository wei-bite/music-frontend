import { defineStore } from "pinia";
import { ref } from 'vue'

export const useUserStore = defineStore('music-store-user', () => {
    const token = ref('')
    const setToken = (newToken) => {
        token.value = newToken
    }
    const removeToken = () => {
        token.value = ''
    }

    return {
        token,
    }
}, {
    // 启用持久化
    persist: true
})