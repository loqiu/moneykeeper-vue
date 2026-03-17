<template>
  <el-dialog
    :model-value="modelValue"
    width="560px"
    destroy-on-close
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #header>
      <div class="space-y-2 pr-8">
        <h2 class="text-xl font-semibold text-slate-900">{{ t('platform.budgets.ruleDialog.title') }}</h2>
        <p class="text-sm leading-6 text-slate-500">
          {{ t('platform.budgets.ruleDialog.description') }}
        </p>
      </div>
    </template>

    <div class="space-y-5">
      <section class="rounded-[28px] border border-slate-200 bg-slate-50/80 p-4">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-slate-700">{{ t('platform.budgets.ruleDialog.currentBudgetLabel') }}</p>
            <p class="mt-2 text-lg font-semibold text-slate-900">{{ budgetName }}</p>
            <p class="mt-1 text-sm text-slate-500">{{ budgetSubtitle }}</p>
          </div>

          <div class="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-3 text-center">
            <p class="text-xs uppercase tracking-[0.24em] text-amber-700">{{ t('platform.budgets.ruleDialog.thresholdBadge') }}</p>
            <p class="mt-2 text-2xl font-semibold text-amber-900">{{ thresholdPreview }}%</p>
          </div>
        </div>
      </section>

      <el-form label-position="top" class="grid gap-4 sm:grid-cols-2" @submit.prevent>
        <el-form-item :label="t('platform.budgets.ruleDialog.thresholdLabel')">
          <el-input-number
            v-model="form.thresholdPercentage"
            :min="1"
            :max="999"
            :step="5"
            controls-position="right"
            class="!w-full"
          />
        </el-form-item>

        <el-form-item :label="t('platform.budgets.ruleDialog.statusLabel')">
          <div class="flex h-[40px] items-center justify-between rounded-2xl border border-slate-200 bg-white px-4">
            <span class="text-sm text-slate-700">
              {{ form.enabled ? t('platform.budgets.rules.enabled') : t('platform.budgets.ruleDialog.disabledTemporarily') }}
            </span>
            <el-switch v-model="form.enabled" />
          </div>
        </el-form-item>

        <el-form-item :label="t('platform.budgets.ruleDialog.notificationTitleLabel')" class="sm:col-span-2">
          <el-input
            v-model="form.notificationTitle"
            maxlength="80"
            :placeholder="t('platform.budgets.ruleDialog.notificationTitlePlaceholder')"
          />
        </el-form-item>

        <el-form-item :label="t('platform.budgets.ruleDialog.notificationMessageLabel')" class="sm:col-span-2">
          <el-input
            v-model="form.notificationMessage"
            type="textarea"
            :rows="4"
            maxlength="200"
            show-word-limit
            :placeholder="t('platform.budgets.ruleDialog.notificationMessagePlaceholder')"
          />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <el-button class="!rounded-full !px-5" @click="$emit('update:modelValue', false)">{{ t('common.cancel') }}</el-button>
        <el-button
          type="primary"
          class="!rounded-full !border-0 !bg-slate-900 !px-6 hover:!bg-slate-800 disabled:!bg-slate-300"
          :loading="loading"
          :disabled="submitDisabled"
          @click="handleSubmit"
        >
          {{ t('platform.budgets.ruleDialog.submitAction') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, defineEmits, defineProps, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

const createDefaultForm = () => ({
  thresholdPercentage: 80,
  enabled: true,
  notificationTitle: '',
  notificationMessage: ''
})

const props = defineProps({
  modelValue: Boolean,
  loading: Boolean,
  budgetName: {
    type: String,
    default: '未命名预算'
  },
  budgetSubtitle: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])
const { t } = useI18n()

const form = reactive(createDefaultForm())

const thresholdPreview = computed(() => Number(form.thresholdPercentage) || 0)

const submitDisabled = computed(() => {
  return !thresholdPreview.value || !form.notificationTitle.trim() || !form.notificationMessage.trim()
})

const resetForm = () => {
  Object.assign(form, createDefaultForm())
}

watch(
  () => props.modelValue,
  (visible) => {
    if (!visible) {
      resetForm()
    }
  }
)

const handleSubmit = () => {
  if (submitDisabled.value) {
    ElMessage.warning(t('platform.budgets.ruleDialog.incompleteWarning'))
    return
  }

  emit('submit', {
    thresholdPercentage: thresholdPreview.value,
    enabled: form.enabled,
    notificationTitle: form.notificationTitle.trim(),
    notificationMessage: form.notificationMessage.trim()
  })
}
</script>

<style scoped>
:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  border-radius: 18px;
  box-shadow: inset 0 0 0 1px #e2e8f0;
}

:deep(.el-input__wrapper.is-focus),
:deep(.el-textarea__inner:focus) {
  box-shadow: inset 0 0 0 2px #0f172a !important;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input-number .el-input__wrapper) {
  width: 100%;
}
</style>
