import { createRouter, createWebHistory } from 'vue-router'
import AccountingPage from '@/views/AccountingPage.vue'
import LoginPage from '@/views/LoginPage.vue'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    redirect: '/accounting'
  },
  {
    path: '/accounting',
    name: 'Accounting',
    component: AccountingPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 需要登录的页面
    if (!userStore.isLoggedIn) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    // 不需要登录的页面
    if (userStore.isLoggedIn && to.path === '/login') {
      next('/accounting')
    } else {
      next()
    }
  }
})

export default router 