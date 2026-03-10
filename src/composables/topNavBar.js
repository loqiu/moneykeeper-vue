import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { deleteUserAccount } from '@/api/modules/users'
import { getApiErrorMessage } from '@/api/response'

export function topNavBar() {
  const userStore = useUserStore()
  const router = useRouter()

  const handleDeleteAccount = async () => {
    try {
      await ElMessageBox.confirm(
        '确定要删除您的账号吗？此操作不可撤销，且本地数据也可能无法恢复。',
        '删除账号',
        {
          confirmButtonText: '确认删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      await deleteUserAccount(userStore.userId)
      userStore.clearUserInfo()
      ElMessage.success('账号已成功删除')
      router.push('/login')
    } catch (error) {
      if (error === 'cancel') {
        return
      }

      ElMessage.error(getApiErrorMessage(error, '删除账号失败，请稍后重试'))
    }
  }

  return {
    handleDeleteAccount
  }
}