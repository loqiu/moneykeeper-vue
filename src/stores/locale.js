import { defineStore } from 'pinia'
import i18n, { DEFAULT_LOCALE, normalizeLocale, setI18nLocale } from '@/i18n'

export const useLocaleStore = defineStore('locale', {
  state: () => ({
    locale: normalizeLocale(i18n.global.locale.value || DEFAULT_LOCALE)
  }),

  getters: {
    isEnglish: (state) => state.locale === 'en-GB'
  },

  actions: {
    initializeLocale() {
      this.locale = setI18nLocale(this.locale)
    },

    setLocale(locale) {
      this.locale = setI18nLocale(locale)
    },

    toggleLocale() {
      this.setLocale(this.locale === 'zh-CN' ? 'en-GB' : 'zh-CN')
    }
  },

  persist: {
    pick: ['locale']
  }
})
