<template>
    <div class="chat-container" :class="{ 'chat-open': isOpen }" v-if="SHOW_CHAT_FEATURE">
      <!-- 聊天框头部 -->
      <div class="chat-header">
        <h3>理财小帮手</h3>
        <button class="close-btn" @click="toggleChat">×</button>
      </div>
      
      <!-- 聊天消息区域 -->
      <div class="chat-messages" ref="messageContainer">
        <div v-for="(message, index) in messages" 
             :key="index" 
             :class="['message', message.role]">
          <div class="message-content">{{ message.content }}</div>
        </div>
      </div>
      
      <!-- 输入框区域 -->
      <div class="chat-input">
        <input 
          v-model="inputMessage" 
          @keyup.enter="sendMessage"
          placeholder="输入消息..."
        >
        <button @click="sendMessage">发送</button>
      </div>
    </div>
     <!-- 触发按钮 -->
    <button class="chat-trigger-icon" @click="toggleChat">
      <!-- <span v-if="!isOpen">AI助手</span>
      <span v-else>关闭聊天</span> -->
      <i class="fa-solid fa-message" v-if="!isOpen">Hi!</i>
      <i class="fa-solid fa-xmark" v-else>Bey!</i>
    </button>
</template>

<script setup>
import { useChat } from '@/composables/aiService'
import '@/assets/styles/AiChatBox.css'
// 添加一个控制变量
const SHOW_CHAT_FEATURE = false
// 使用 useChat composable，解构需要的状态和方法
const {
  isOpen,
  inputMessage,
  messages,
  messageContainer,
  toggleChat,
  sendMessage
} = useChat()
</script>