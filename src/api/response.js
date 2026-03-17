import { resolveErrorMessage } from '@/i18n/messageResolver'

const getPayloadMeta = (payload = {}) => ({
  errorKey: payload?.errorKey || '',
  errorParams: payload?.errorParams || {},
  message: payload?.message || '',
  traceId: payload?.traceId || ''
})

const createApiError = (payload = {}, fallbackMessage, fallbackKey = 'errors.common.request_failed') => {
  const message = resolveErrorMessage({
    ...getPayloadMeta(payload),
    fallbackKey,
    fallbackMessage
  })

  const error = new Error(message)
  error.errorKey = payload?.errorKey || ''
  error.errorParams = payload?.errorParams || {}
  error.apiMessage = payload?.message || ''
  error.traceId = payload?.traceId || ''
  return error
}

export const getApiErrorMessage = (
  error,
  fallbackMessage = '请求失败',
  {
    fallbackKey = 'errors.common.request_failed'
  } = {}
) => {
  const payload = error?.response?.data

  if (payload && typeof payload === 'object') {
    return resolveErrorMessage({
      ...getPayloadMeta(payload),
      fallbackKey,
      fallbackMessage
    })
  }

  if (error?.errorKey || error?.apiMessage) {
    return resolveErrorMessage({
      errorKey: error.errorKey,
      errorParams: error.errorParams,
      message: error.apiMessage || error.message,
      fallbackKey,
      fallbackMessage
    })
  }

  return error?.message || fallbackMessage
}

const isMkApiResponsePayload = (payload) => {
  return Boolean(
    payload &&
    typeof payload === 'object' &&
    !Array.isArray(payload) &&
    typeof payload.code === 'number' &&
    (Object.prototype.hasOwnProperty.call(payload, 'data') || Object.prototype.hasOwnProperty.call(payload, 'message'))
  )
}

export const unwrapMkApiResponse = (
  response,
  fallbackMessage = '请求失败',
  {
    allowUndefinedData = false,
    fallbackKey = 'errors.common.request_failed'
  } = {}
) => {
  const payload = response?.data

  if (!payload || payload.code !== 200) {
    throw createApiError(payload, fallbackMessage, fallbackKey)
  }

  if (!allowUndefinedData && typeof payload.data === 'undefined') {
    throw createApiError(payload, fallbackMessage, fallbackKey)
  }

  return payload.data
}

export const unwrapResponseData = (
  response,
  fallbackMessage = '请求失败',
  {
    allowUndefinedData = false,
    fallbackKey = 'errors.common.request_failed'
  } = {}
) => {
  const payload = response?.data

  if (isMkApiResponsePayload(payload)) {
    return unwrapMkApiResponse(response, fallbackMessage, { allowUndefinedData, fallbackKey })
  }

  if (!allowUndefinedData && typeof payload === 'undefined') {
    throw new Error(fallbackMessage)
  }

  return payload
}
