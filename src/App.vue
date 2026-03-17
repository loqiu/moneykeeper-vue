<template>
  <el-config-provider :locale="elementPlusLocale">
    <router-view></router-view>
  </el-config-provider>
</template>

<script setup>
import { computed } from 'vue'
import en from 'element-plus/dist/locale/en.mjs'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { storeToRefs } from 'pinia'
import { useLocaleStore } from '@/stores/locale'

const localeStore = useLocaleStore()
const { locale } = storeToRefs(localeStore)

const elementPlusLocale = computed(() => {
  return locale.value === 'en-GB' ? en : zhCn
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh;
  margin: 0;
  padding: 0;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>
