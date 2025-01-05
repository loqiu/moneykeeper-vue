import axios from 'axios'
import { ref, nextTick } from 'vue'

// 创建聊天相关的状态
const isOpen = ref(false)
const inputMessage = ref('')
const messages = ref([
  { role: 'assistant', content: '你好！我是理财小帮手，有什么可以帮你的吗？' }
])
const messageContainer = ref(null)

// AI服务相关方法
const aiService = {
  async sendMessage(message) {
    try {
      const response = await axios.post('/api/aiService/chat', { message })
      return response.data
    } catch (error) {
      console.error('AI服务调用失败:', error)
      throw error
    }
  }
}

// 封装聊天相关的方法
export function useChat() {
  // 切换聊天框显示状态
  const toggleChat = () => {
    isOpen.value = !isOpen.value
  }

  // 滚动到底部
  const scrollToBottom = () => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  }

  // 发送消息
  const sendMessage = async () => {
    if (!inputMessage.value.trim()) return
    
    // 添加用户消息
    const userMessage = inputMessage.value
    messages.value.push({
      role: 'user',
      content: userMessage
    })
    
    // 清空输入框
    inputMessage.value = ''
    
    // 滚动到底部
    await nextTick()
    scrollToBottom()
    
    try {
      // 调用AI服务
      const response = await aiService.sendMessage(userMessage)
      
      // 添加AI回复
      messages.value.push({
        role: 'assistant',
        content: response.message || '抱歉，您的问题过于高深，让我学习一下再来帮助您。'
      })
      
      await nextTick()
      scrollToBottom()
    } catch (error) {
      // 显示错误消息
      messages.value.push({
        role: 'assistant',
        content: '抱歉，我有点困，请一会再问我。'
      })
      console.error('发送消息失败:', error)
    }
  }

  return {
    isOpen,
    inputMessage,
    messages,
    messageContainer,
    toggleChat,
    sendMessage,
    scrollToBottom
  }
}
