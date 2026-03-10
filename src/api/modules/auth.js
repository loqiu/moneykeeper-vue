import request from '@/utils/axios'
import { unwrapMkApiResponse } from '@/api/response'
import { mapLoginResponse } from '@/api/mappers/authMapper'

export const login = async (credentials) => {
  const response = await request.post('/auth/login', credentials)
  return mapLoginResponse(unwrapMkApiResponse(response, '登录失败'))
}

export const logout = async () => {
  const response = await request.post('/auth/logout')
  return unwrapMkApiResponse(response, '退出登录失败')
}

export const register = async (payload) => {
  const response = await request.post('/auth/register', payload)
  return unwrapMkApiResponse(response, '注册失败')
}

export const googleLogin = async (idToken) => {
  const response = await request.post('/auth/google', { idToken })
  return mapLoginResponse(unwrapMkApiResponse(response, 'Google 登录失败'))
}
