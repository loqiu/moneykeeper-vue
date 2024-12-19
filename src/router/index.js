import { createRouter, createWebHistory } from 'vue-router'
import AccountingPage from '@/views/AccountingPage.vue'
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
    component: () => import('@/views/LoginPage.vue')
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('@/views/StripeCheckoutPage.vue')
  },
  {
    path: '/payment/success',
    name: 'PaymentSuccess',
    component: () => import('@/views/PaymentSuccessPage.vue')
  },
  {
    path: '/payment/cancel',
    name: 'PaymentCancel',
    component: () => import('@/views/PaymentCancelPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 全局路由守卫
router.beforeEach(async (to, from, next) => {
  console.log('路由跳转:', { to, from })
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