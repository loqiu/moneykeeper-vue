import i18n from '@/i18n'

const isPlainObject = (value) => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

const safeParams = (params) => {
  return isPlainObject(params) ? params : {}
}

const hasTranslation = (key) => {
  return Boolean(key) && i18n.global.te(key)
}

const translate = (key, params = {}) => {
  if (!hasTranslation(key)) {
    return ''
  }

  return i18n.global.t(key, safeParams(params))
}

const getErrorTranslationKey = (errorKey) => {
  return errorKey ? `errors.${errorKey}` : ''
}

const getNotificationTranslationKey = (eventKey, field) => {
  return eventKey ? `notifications.events.${eventKey}.${field}` : ''
}

export const resolveErrorMessage = ({
  errorKey = '',
  errorParams = {},
  message = '',
  fallbackKey = 'errors.common.request_failed',
  fallbackParams = {},
  fallbackMessage = ''
} = {}) => {
  const translatedMessage = translate(getErrorTranslationKey(errorKey), errorParams)
  if (translatedMessage) {
    return translatedMessage
  }

  if (message) {
    return message
  }

  const translatedFallback = translate(fallbackKey, fallbackParams)
  if (translatedFallback) {
    return translatedFallback
  }

  return fallbackMessage || 'Request failed'
}

export const resolveNotificationContent = ({
  eventKey = '',
  payload = {},
  title = '',
  message = ''
} = {}) => {
  const normalizedPayload = safeParams(payload)

  return {
    title: translate(getNotificationTranslationKey(eventKey, 'title'), normalizedPayload)
      || title
      || translate('notifications.defaults.title')
      || 'New notification',
    message: translate(getNotificationTranslationKey(eventKey, 'message'), normalizedPayload)
      || message
      || translate('notifications.defaults.message')
      || ''
  }
}

export const resolveCommonMessage = (key, params = {}, fallback = '') => {
  return translate(key, params) || fallback
}
