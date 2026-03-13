<template>
  <el-dialog
    :model-value="modelValue"
    width="560px"
    destroy-on-close
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #header>
      <div class="space-y-2 pr-8">
        <h2 class="text-xl font-semibold text-slate-900">新增预算提醒规则</h2>
        <p class="text-sm leading-6 text-slate-500">
          当预算使用率达到指定阈值时，后端会把规则命中状态回流到通知中心和预算进度里。
        </p>
      </div>
    </template>

    <div class="space-y-5">
      <section class="rounded-[28px] border border-slate-200 bg-slate-50/80 p-4">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-slate-700">当前预算</p>
            <p class="mt-2 text-lg font-semibold text-slate-900">{{ budgetName }}</p>
            <p class="mt-1 text-sm text-slate-500">{{ budgetSubtitle }}</p>
          </div>

          <div class="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-3 text-center">
            <p class="text-xs uppercase tracking-[0.24em] text-amber-700">Threshold</p>
            <p class="mt-2 text-2xl font-semibold text-amber-900">{{ thresholdPreview }}%</p>
          </div>
        </div>
      </section>

      <el-form label-position="top" class="grid gap-4 sm:grid-cols-2" @submit.prevent>
        <el-form-item label="阈值百分比">
          <el-input-number
            v-model="form.thresholdPercentage"
            :min="1"
            :max="999"
            :step="5"
            controls-position="right"
            class="!w-full"
          />
        </el-form-item>

        <el-form-item label="规则状态">
          <div class="flex h-[40px] items-center justify-between rounded-2xl border border-slate-200 bg-white px-4">
            <span class="text-sm text-slate-700">{{ form.enabled ? '已启用' : '暂不启用' }}</span>
            <el-switch v-model="form.enabled" />
          </div>
        </el-form-item>

        <el-form-item label="通知标题" class="sm:col-span-2">
          <el-input
            v-model="form.notificationTitle"
            maxlength="80"
            placeholder="例如：餐饮预算即将用完"
          />
        </el-form-item>

        <el-form-item label="通知内容" class="sm:col-span-2">
          <el-input
            v-model="form.notificationMessage"
            type="textarea"
            :rows="4"
            maxlength="200"
            show-word-limit
            placeholder="例如：本月餐饮预算已经达到 80%，请留意接下来几天的支出节奏。"
          />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <el-button class="!rounded-full !px-5" @click="$emit('update:modelValue', false)">取消</el-button>
        <el-button
          type="primary"
          class="!rounded-full !border-0 !bg-slate-900 !px-6 hover:!bg-slate-800 disabled:!bg-slate-300"
          :loading="loading"
          :disabled="submitDisabled"
          @click="handleSubmit"
        >
          保存规则
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, defineEmits, defineProps, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'

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
    ElMessage.warning('请完整填写预算规则')
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
