import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { deleteUserAccount } from '@/api/modules/users'
import { getApiErrorMessage } from '@/api/response'

export function topNavBar() {
  const userStore = useUserStore()
  const router = useRouter()

  const handleDeleteAccount = () => {
    ElMessageBox.confirm(
      '确定要删除您的账户吗？此操作不可逆。',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      try {
        await deleteUserAccount(userStore.userId)
        userStore.clearUserInfo()
        ElMessage({
          type: 'success',
          message: '账号已成功删除'
        })

        setTimeout(() => {
          router.push('/login')
        }, 1000)
      } catch (error) {
        ElMessage({
          type: 'error',
          message: getApiErrorMessage(error, '删除账号失败，请稍后重试')
        })
      }
    }).catch(() => {})
  }

  return {
    handleDeleteAccount
  }
}
