import { ElMessageBox, ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import request from '@/utils/axios'
// import axios from 'axios'

export function topNavBar() {
    const userStore = useUserStore()
    const router = useRouter()

        // 处理删除账号按钮点击
    const handleDeleteAccount = () => {
        ElMessageBox.confirm(
            '确定要删除您的账号吗？此操作不可逆',
            '警告',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        ).then(async () => {
            try {
                // 调用删除账号的 API
                await request.delete(`/users/${userStore.userId}`)
                
                // 显示成功提示
                ElMessage({
                    type: 'success',
                    message: '账号已成功删除'
                })
                
                // TODO: 可以在这里添加登出逻辑或跳转到登录页面
                // 清除用户信息
                userStore.clearUserInfo()
                
                // 清除 token
                localStorage.removeItem('token')
                
                // 延迟 1 秒后跳转到登录页面，让用户能看到成功提示
                setTimeout(() => {
                    router.push('/login')
                }, 1000)

            } catch (error) {
                // 显示错误提示
                ElMessage({
                    type: 'error',
                    message: '删除账号失败，请稍后重试'
                })
            }
        }).catch(() => {
            // 用户点击取消，不做任何操作
        })
    }

    return {
        handleDeleteAccount
    }
}