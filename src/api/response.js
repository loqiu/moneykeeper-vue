export const getApiErrorMessage = (error, fallbackMessage = '请求失败') => {
  return error.response?.data?.message || error.message || fallbackMessage
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