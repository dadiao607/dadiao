import { defineStore } from 'pinia'
import { login, getUserInfo, logout } from '@/api/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: {},
    permissions: []
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token,
    username: (state) => state.userInfo.username || '',
    avatar: (state) => state.userInfo.avatar || '',
    roles: (state) => state.userInfo.roles || []
  },
  
  actions: {
    // 登录
    async loginAction(userInfo) {
      try {
        const response = await login(userInfo)
        const { data } = response
        this.token = data.token
        localStorage.setItem('token', data.token)
        return Promise.resolve(data)
      } catch (error) {
        return Promise.reject(error)
      }
    },
    
    // 获取用户信息
    async getUserInfoAction() {
      try {
        const response = await getUserInfo()
        const { data } = response
        this.userInfo = data
        this.permissions = data.permissions || []
        return Promise.resolve(data)
      } catch (error) {
        return Promise.reject(error)
      }
    },
    
    // 登出
    async logoutAction() {
      try {
        await logout()
        this.resetState()
        return Promise.resolve()
      } catch (error) {
        return Promise.reject(error)
      }
    },
    
    // 重置状态
    resetState() {
      this.token = ''
      this.userInfo = {}
      this.permissions = []
      localStorage.removeItem('token')
    }
  }
}) 