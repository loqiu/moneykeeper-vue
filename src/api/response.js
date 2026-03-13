export const getApiErrorMessage = (error, fallbackMessage = '请求失败') => {
  return error.response?.data?.message || error.message || fallbackMessage
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
  { allowUndefinedData = false } = {}
) => {
  const payload = response?.data

  if (!payload || payload.code !== 200) {
    throw new Error(payload?.message || fallbackMessage)
  }

  if (!allowUndefinedData && typeof payload.data === 'undefined') {
    throw new Error(payload.message || fallbackMessage)
  }

  return payload.data
}

export const unwrapResponseData = (
  response,
  fallbackMessage = '请求失败',
  { allowUndefinedData = false } = {}
) => {
  const payload = response?.data

  if (isMkApiResponsePayload(payload)) {
    return unwrapMkApiResponse(response, fallbackMessage, { allowUndefinedData })
  }

  if (!allowUndefinedData && typeof payload === 'undefined') {
    throw new Error(fallbackMessage)
  }

  return payload
}
