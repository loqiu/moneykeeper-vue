import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/assets/styles/global.css'
import i18n from '@/i18n'
import { useLedgerStore } from './stores/ledger'
import { useLocaleStore } from './stores/locale'
import { useNotificationStore } from './stores/notification'
import { useUserStore } from './stores/user'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(i18n)
app.use(router)
app.use(ElementPlus)

const localeStore = useLocaleStore()
localeStore.initializeLocale()

const userStore = useUserStore()
userStore.initializeFromStorage()

if (userStore.isLoggedIn) {
  const ledgerStore = useLedgerStore()
  const notificationStore = useNotificationStore()
  ledgerStore.initializeLedgers()
  notificationStore.initializeUnreadCount()
}

app.mount('#app')
