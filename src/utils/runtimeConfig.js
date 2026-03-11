const DEFAULT_DEV_API_BASE_URL = '/api'
const DEFAULT_PROD_API_BASE_URL = 'https://api.money-keeper.com/api'
const DEFAULT_DEV_SSE_BASE_URL = '/api'
const DEFAULT_PROD_SSE_BASE_URL = 'https://api.money-keeper.com/api'
const DEFAULT_PROD_WEB_ORIGIN = 'https://money-keeper.com'

const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '')

export const isProductionRuntime = () => process.env.NODE_ENV === 'production'

export const getApiBaseUrl = () => {
  const configuredValue = process.env.VUE_APP_API_URL

  if (isProductionRuntime()) {
    return trimTrailingSlash(configuredValue || DEFAULT_PROD_API_BASE_URL)
  }

  return trimTrailingSlash(configuredValue || DEFAULT_DEV_API_BASE_URL)
}

export const getWebOrigin = () => {
  if (!isProductionRuntime()) {
    return ''
  }

  const configuredValue = process.env.VUE_APP_WEB_ORIGIN

  return trimTrailingSlash(configuredValue || DEFAULT_PROD_WEB_ORIGIN)
}

export const getSseBaseUrl = () => {
  const configuredValue = process.env.VUE_APP_SSE_BASE_URL

  if (isProductionRuntime()) {
    return trimTrailingSlash(configuredValue || DEFAULT_PROD_SSE_BASE_URL)
  }

  return trimTrailingSlash(configuredValue || DEFAULT_DEV_SSE_BASE_URL)
}

export const getSseSubscribeUrl = (userId) => {
  return new URL(`notifications/subscribe/${userId}`, `${getSseBaseUrl()}/`).toString()
}
