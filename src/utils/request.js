import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

// 创建axios实例
const service = axios.create({
  baseURL: '/api', // API的基础URL
  timeout: 15000 // 请求超时时间
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在发送请求之前做一些处理
    const token = localStorage.getItem('token')
    if (token) {
      // 让每个请求携带token-- ['Authorization']为自定义key
      config.headers['Authorization'] = 'Bearer ' + token
    }
    return config
  },
  error => {
    // 处理请求错误
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 拦截器处理响应
    const res = response.data
    
    // 假设后端规定正常返回code是20000
    if (res.code !== 20000) {
      // 错误提示
      ElMessage({
        message: res.message || '系统错误',
        type: 'error',
        duration: 5 * 1000
      })
      
      // 50008:非法的token; 50012:其他客户端登录了;  50014:Token 过期了;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // 重新登录
        ElMessageBox.confirm('您的登录已过期，请重新登录', '确认登出', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          localStorage.removeItem('token')
          window.location.reload()
        })
      }
      return Promise.reject(new Error(res.message || '系统错误'))
    } else {
      return res
    }
  },
  error => {
    console.log('响应错误: ' + error) // for debug
    ElMessage({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service 