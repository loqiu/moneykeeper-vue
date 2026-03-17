import request from '@/utils/axios'
import { unwrapMkApiResponse } from '@/api/response'
import { resolveCommonMessage } from '@/i18n/messageResolver'

const DEFAULT_STATUS = {
  enabled: false,
  provider: 'stripe',
  defaultCurrency: 'gbp',
  implemented: false,
  apiReady: false,
  webhookReady: false,
  ready: false,
  billingPortalReturnUrlConfigured: false
}

const DEFAULT_SUBSCRIPTION = {
  active: false,
  status: 'none',
  planCode: '',
  planName: '',
  currency: 'gbp',
  amountMinor: 0,
  billingInterval: 'month',
  currentPeriodStart: '',
  currentPeriodEnd: '',
  cancelAtPeriodEnd: false,
  canceledAt: '',
  stripeSubscriptionId: ''
}

const normalizePlan = (plan = {}) => ({
  code: plan.code || '',
  name: plan.name || '',
  description: plan.description || '',
  currency: plan.currency || 'gbp',
  amountMinor: Number(plan.amountMinor || 0),
  billingInterval: plan.billingInterval || 'month'
})

const normalizeOrder = (order = {}) => ({
  orderNo: order.orderNo || '',
  planCode: order.planCode || '',
  planName: order.planName || '',
  orderType: order.orderType || '',
  status: order.status || '',
  currency: order.currency || 'gbp',
  amountMinor: Number(order.amountMinor || 0),
  stripeCheckoutSessionId: order.stripeCheckoutSessionId || '',
  stripeInvoiceId: order.stripeInvoiceId || '',
  stripeSubscriptionId: order.stripeSubscriptionId || '',
  paidAt: order.paidAt || '',
  createdAt: order.createdAt || '',
  updatedAt: order.updatedAt || ''
})

export const fetchPaymentStatus = async () => {
  const response = await request.get('/payments/status')
  const data = unwrapMkApiResponse(
    response,
    resolveCommonMessage('billing.checkout.errors.statusFetchFailed', {}, 'Failed to fetch the payment status')
  ) || {}

  return {
    ...DEFAULT_STATUS,
    enabled: Boolean(data.enabled),
    provider: data.provider || DEFAULT_STATUS.provider,
    defaultCurrency: data.defaultCurrency || DEFAULT_STATUS.defaultCurrency,
    implemented: Boolean(data.implemented),
    apiReady: Boolean(data.apiReady),
    webhookReady: Boolean(data.webhookReady),
    ready: Boolean(data.ready),
    billingPortalReturnUrlConfigured: Boolean(data.billingPortalReturnUrlConfigured)
  }
}

export const fetchPaymentPlans = async () => {
  const response = await request.get('/payments/plans')
  const data = unwrapMkApiResponse(
    response,
    resolveCommonMessage('billing.checkout.errors.plansFetchFailed', {}, 'Failed to load payment plans'),
    { allowUndefinedData: true }
  )

  return Array.isArray(data) ? data.map(normalizePlan) : []
}

export const fetchCurrentSubscription = async () => {
  const response = await request.get('/payments/subscriptions/current')
  const data = unwrapMkApiResponse(
    response,
    resolveCommonMessage('billing.checkout.errors.subscriptionFetchFailed', {}, 'Failed to load the current subscription'),
    { allowUndefinedData: true }
  ) || {}

  return {
    ...DEFAULT_SUBSCRIPTION,
    active: Boolean(data.active),
    status: data.status || DEFAULT_SUBSCRIPTION.status,
    planCode: data.planCode || '',
    planName: data.planName || '',
    currency: data.currency || DEFAULT_SUBSCRIPTION.currency,
    amountMinor: Number(data.amountMinor || 0),
    billingInterval: data.billingInterval || DEFAULT_SUBSCRIPTION.billingInterval,
    currentPeriodStart: data.currentPeriodStart || '',
    currentPeriodEnd: data.currentPeriodEnd || '',
    cancelAtPeriodEnd: Boolean(data.cancelAtPeriodEnd),
    canceledAt: data.canceledAt || '',
    stripeSubscriptionId: data.stripeSubscriptionId || ''
  }
}

export const fetchPaymentOrders = async () => {
  const response = await request.get('/payments/orders')
  const data = unwrapMkApiResponse(
    response,
    resolveCommonMessage('errors.common.request_failed', {}, 'Failed to load payment orders'),
    { allowUndefinedData: true }
  )

  return Array.isArray(data) ? data.map(normalizeOrder) : []
}

export const createCheckoutSession = async (payload) => {
  const response = await request.post('/payments/checkout-sessions', payload)
  const data = unwrapMkApiResponse(
    response,
    resolveCommonMessage('billing.checkout.errors.checkoutFailed', {}, 'Failed to start checkout')
  ) || {}

  return {
    orderNo: data.orderNo || '',
    planCode: data.planCode || '',
    checkoutSessionId: data.checkoutSessionId || '',
    checkoutUrl: data.checkoutUrl || '',
    status: data.status || ''
  }
}

export const createBillingPortalSession = async (payload = {}) => {
  const response = await request.post('/payments/billing-portal-sessions', payload)
  const data = unwrapMkApiResponse(
    response,
    resolveCommonMessage('billing.checkout.errors.portalOpenFailed', {}, 'Failed to open the billing portal'),
    { allowUndefinedData: true }
  ) || {}

  return {
    url: data.url || ''
  }
}

export const cancelCurrentSubscription = async () => {
  const response = await request.post('/payments/subscriptions/current/cancel')
  return unwrapMkApiResponse(
    response,
    resolveCommonMessage('billing.checkout.errors.cancelFailed', {}, 'Failed to cancel the subscription'),
    { allowUndefinedData: true }
  )
}
