import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    redirect: '/accounting'
  },
  {
    path: '/accounting',
    name: 'Accounting',
    component: () => import('@/views/AccountingPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ledgers',
    name: 'Ledgers',
    component: () => import('@/views/LedgersPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ledgers/:ledgerId/members',
    name: 'LedgerMembers',
    component: () => import('@/views/LedgerMembersPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('@/views/CategoriesPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/budgets',
    name: 'Budgets',
    component: () => import('@/views/BudgetsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('@/views/StatisticsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/SearchPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/exports',
    name: 'Exports',
    component: () => import('@/views/ExportJobsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('@/views/NotificationsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginPage.vue')
  },
  {
    path: '/billing',
    name: 'Billing',
    component: () => import('@/views/StripeCheckoutPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/checkout',
    redirect: '/billing'
  },
  {
    path: '/billing/success',
    name: 'BillingSuccess',
    component: () => import('@/views/PaymentSuccessPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/payment/success',
    redirect: '/billing/success'
  },
  {
    path: '/billing/cancel',
    name: 'BillingCancel',
    component: () => import('@/views/PaymentCancelPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/payment/cancel',
    redirect: '/billing/cancel'
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!userStore.isLoggedIn) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else if (userStore.isLoggedIn && to.path === '/login') {
    next('/accounting')
  } else {
    next()
  }
})

export default router
