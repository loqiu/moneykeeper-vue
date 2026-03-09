export const USER_INFO_STORAGE_KEY = 'userInfo'

export const stripBearerPrefix = (token) => {
  if (typeof token !== 'string') {
    return ''
  }

  return token.replace(/^Bearer\s+/i, '').trim()
}

export const normalizeAuthToken = (token) => {
  const rawToken = stripBearerPrefix(token)
  return rawToken ? `Bearer ${rawToken}` : ''
}

export const sanitizeUserInfo = (userInfo) => {
  if (!userInfo || typeof userInfo !== 'object') {
    return null
  }

  const normalizedUserId = Number(userInfo.userId)
  const normalizedToken = stripBearerPrefix(userInfo.token)

  if (Number.isNaN(normalizedUserId) || !normalizedToken) {
    return null
  }

  return {
    userPin: userInfo.userPin ?? null,
    userId: normalizedUserId,
    username: userInfo.username ?? '',
    token: normalizedToken
  }
}

export const parseStoredUserInfo = (rawValue) => {
  if (!rawValue) {
    return null
  }

  try {
    return sanitizeUserInfo(JSON.parse(rawValue))
  } catch (error) {
    console.error('解析本地用户信息失败:', error)
    return null
  }
}
