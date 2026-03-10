import request from '@/utils/axios'

export const deleteUserAccount = async (userId) => {
  await request.delete(`/users/${userId}`)
}
