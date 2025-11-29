import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import axios from '@/utils/axios'

export function useRegister() {

  // 控制注册对话框显示
  const registerDialogVisible = ref(false)
  const loading = ref(false)
  const registerFormRef = ref(null)

  // 注册表单数据
  const registerForm = ref({
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: ''
  })

  // 表单验证规则
  const rules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 3, max: 50, message: '用户名长度应在 3 到 50 个字符之间', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, max: 255, message: '密码长度应在 6 到 255 个字符之间', trigger: 'blur' }
    ],
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
      { max: 255, message: '邮箱长度不能超过 255 个字符', trigger: 'blur' }
    ],
    firstName: [
      { required: true, message: '请输入名字', trigger: 'blur' },
      { max: 50, message: '名字长度不能超过 50 个字符', trigger: 'blur' }
    ],
    lastName: [
      { required: true, message: '请输入姓氏', trigger: 'blur' },
      { max: 50, message: '姓氏长度不能超过 50 个字符', trigger: 'blur' }
    ],
    phoneNumber: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^[0-9+\-\s]{5,20}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
    ]
  }

  // 重置表单
  const resetForm = (formEl) => {
    if (!formEl) return
    formEl.resetFields()
  }

  // 处理注册
  const handleRegister = async (formEl) => {
    if (!formEl) return

    await formEl.validate(async (valid) => {
      if (valid) {
        loading.value = true
        try {
          const response = await axios.post('/auth/register', registerForm.value)

          if (response.data.data) {
            ElMessage.success('注册成功！请登录')
            registerDialogVisible.value = false
            // 清空表单
            resetForm(formEl)
          }
        } catch (error) {
          const errorMsg = error.response?.data?.message || '注册失败，请稍后重试'
          ElMessage.error(errorMsg)
        } finally {
          loading.value = false
        }
      }
    })
  }

  // 取消注册
  const handleCancel = () => {
    registerDialogVisible.value = false
    resetForm(registerFormRef.value)
  }

  return {
    registerDialogVisible,
    registerForm,
    registerFormRef,
    loading,
    rules,
    handleRegister,
    resetForm,
    handleCancel
  }
}