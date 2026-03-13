import { defineStore } from 'pinia'
import { createLedger as createLedgerRequest, fetchDefaultLedger, fetchLedgers } from '@/api/modules/ledgers'
import { getApiErrorMessage } from '@/api/response'

export const useLedgerStore = defineStore('ledger', {
  state: () => ({
    ledgerList: [],
    currentLedgerId: null,
    defaultLedgerId: null,
    currentLedgerRole: '',
    isLoading: false,
    errorMessage: '',
    initialized: false
  }),

  getters: {
    currentLedger: (state) => state.ledgerList.find((item) => item.id === state.currentLedgerId) || null,
    currentLedgerName() {
      return this.currentLedger?.name || '未选择账本'
    },
    hasLedgers: (state) => state.ledgerList.length > 0
  },

  actions: {
    resetLedgerState() {
      this.ledgerList = []
      this.currentLedgerId = null
      this.defaultLedgerId = null
      this.currentLedgerRole = ''
      this.isLoading = false
      this.errorMessage = ''
      this.initialized = false
    },

    syncCurrentLedger() {
      const currentLedger = this.ledgerList.find((item) => item.id === this.currentLedgerId)
      this.currentLedgerRole = currentLedger?.memberRole || ''
    },

    selectLedger(ledgerId) {
      const normalizedId = Number(ledgerId)

      if (Number.isNaN(normalizedId)) {
        return
      }

      this.currentLedgerId = normalizedId
      this.syncCurrentLedger()
    },

    async initializeLedgers({ force = false } = {}) {
      if (this.initialized && !force) {
        return
      }

      this.isLoading = true
      this.errorMessage = ''

      try {
        const [ledgerList, defaultLedger] = await Promise.all([
          fetchLedgers(),
          fetchDefaultLedger()
        ])

        this.ledgerList = Array.isArray(ledgerList) ? ledgerList : []
        this.defaultLedgerId = defaultLedger?.id || this.ledgerList.find((item) => item.defaultLedger)?.id || null

        const hasCurrentLedger = this.ledgerList.some((item) => item.id === this.currentLedgerId)
        if (!hasCurrentLedger) {
          this.currentLedgerId = this.defaultLedgerId || this.ledgerList[0]?.id || null
        }

        this.syncCurrentLedger()
        this.initialized = true
      } catch (error) {
        this.errorMessage = getApiErrorMessage(error, '获取账本信息失败')
      } finally {
        this.isLoading = false
      }
    },

    async refreshLedgers() {
      await this.initializeLedgers({ force: true })
    },

    async createLedger(payload) {
      const createdLedger = await createLedgerRequest(payload)

      const exists = this.ledgerList.some((item) => item.id === createdLedger.id)
      if (!exists) {
        this.ledgerList = [createdLedger, ...this.ledgerList]
      }

      if (!this.currentLedgerId) {
        this.currentLedgerId = createdLedger.id
      }

      if (createdLedger.defaultLedger) {
        this.defaultLedgerId = createdLedger.id
      }

      this.syncCurrentLedger()
      return createdLedger
    }
  },

  persist: {
    pick: ['currentLedgerId']
  }
})
