import { createI18n } from 'vue-i18n'
import enGB from '@/i18n/locales/en-GB.json'
import zhCN from '@/i18n/locales/zh-CN.json'

export const DEFAULT_LOCALE = 'zh-CN'
export const SUPPORTED_LOCALES = ['zh-CN', 'en-GB']
const STORAGE_KEY = 'moneykeeper-locale'

export const normalizeLocale = (locale) => {
  if (!locale || typeof locale !== 'string') {
    return DEFAULT_LOCALE
  }

  const lowered = locale.toLowerCase()
  if (lowered.startsWith('zh')) {
    return 'zh-CN'
  }

  if (lowered.startsWith('en')) {
    return 'en-GB'
  }

  return DEFAULT_LOCALE
}

export const getStoredLocale = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE
  }

  return normalizeLocale(window.localStorage.getItem(STORAGE_KEY))
}

export const detectBrowserLocale = () => {
  if (typeof navigator === 'undefined') {
    return DEFAULT_LOCALE
  }

  return normalizeLocale(navigator.language)
}

export const resolveInitialLocale = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE
  }

  const storedLocale = window.localStorage.getItem(STORAGE_KEY)
  if (storedLocale) {
    return normalizeLocale(storedLocale)
  }

  return detectBrowserLocale()
}

const i18n = createI18n({
  legacy: false,
  locale: resolveInitialLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  messages: {
    'zh-CN': zhCN,
    'en-GB': enGB
  }
})

export const setI18nLocale = (locale) => {
  const normalizedLocale = normalizeLocale(locale)
  i18n.global.locale.value = normalizedLocale

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, normalizedLocale)
  }

  return normalizedLocale
}

export default i18n
