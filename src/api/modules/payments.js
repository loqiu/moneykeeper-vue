import request from '@/utils/axios'
import { unwrapMkApiResponse } from '@/api/response'

export const fetchPaymentStatus = async () => {
  const response = await request.get('/payments/status')
  const data = unwrapMkApiResponse(response, '获取支付状态失败')

  return {
    enabled: Boolean(data.enabled),
    provider: data.provider || 'stripe',
    defaultCurrency: data.defaultCurrency || 'usd',
    implemented: Boolean(data.implemented)
  }
}
