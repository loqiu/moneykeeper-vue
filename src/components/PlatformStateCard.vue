<template>
  <section :class="wrapperClass">
    <div :class="contentClass">
      <div :class="iconWrapperClass">
        <el-icon :size="22" :class="iconClass">
          <component :is="iconComponent" />
        </el-icon>
      </div>

      <div class="min-w-0">
        <p :class="titleClass">{{ title }}</p>
        <p v-if="description" :class="descriptionClass">{{ description }}</p>
        <div v-if="$slots.default" class="mt-3">
          <slot />
        </div>
      </div>
    </div>

    <div v-if="actionLabel || $slots.actions" :class="actionsClass">
      <el-button
        v-if="actionLabel"
        class="!rounded-full !px-4"
        :type="actionType"
        :disabled="actionDisabled"
        @click="$emit('action')"
      >
        {{ actionLabel }}
      </el-button>
      <slot name="actions" />
    </div>
  </section>
</template>

<script setup>
import { computed, defineEmits, defineProps } from 'vue'
import {
  CircleCloseFilled,
  FolderOpened,
  InfoFilled,
  Loading,
  WarningFilled
} from '@element-plus/icons-vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'empty'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  compact: {
    type: Boolean,
    default: false
  },
  centered: {
    type: Boolean,
    default: true
  },
  actionLabel: {
    type: String,
    default: ''
  },
  actionType: {
    type: String,
    default: 'default'
  },
  actionDisabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['action'])

const paletteMap = {
  empty: {
    wrapper: 'border-dashed border-slate-300 bg-white',
    iconWrapper: 'bg-slate-100 text-slate-500',
    title: 'text-slate-900',
    description: 'text-slate-500'
  },
  loading: {
    wrapper: 'border border-slate-200 bg-white',
    iconWrapper: 'bg-slate-100 text-slate-600',
    title: 'text-slate-900',
    description: 'text-slate-500'
  },
  error: {
    wrapper: 'border border-rose-200 bg-rose-50',
    iconWrapper: 'bg-rose-100 text-rose-700',
    title: 'text-rose-900',
    description: 'text-rose-700'
  },
  warning: {
    wrapper: 'border border-amber-200 bg-amber-50',
    iconWrapper: 'bg-amber-100 text-amber-700',
    title: 'text-amber-950',
    description: 'text-amber-900'
  },
  info: {
    wrapper: 'border border-sky-200 bg-sky-50',
    iconWrapper: 'bg-sky-100 text-sky-700',
    title: 'text-sky-950',
    description: 'text-sky-900'
  }
}

const iconMap = {
  empty: FolderOpened,
  loading: Loading,
  error: CircleCloseFilled,
  warning: WarningFilled,
  info: InfoFilled
}

const palette = computed(() => paletteMap[props.variant] || paletteMap.empty)
const iconComponent = computed(() => iconMap[props.variant] || iconMap.empty)

const wrapperClass = computed(() => {
  const base = props.compact
    ? 'rounded-[24px] px-5 py-4'
    : 'rounded-[28px] px-6 py-14'

  return `${base} ${palette.value.wrapper}`
})

const contentClass = computed(() => {
  const align = props.centered ? 'items-center text-center' : 'items-start text-left'
  const compactLayout = props.compact ? 'gap-3 sm:flex-row' : 'gap-4'
  return `mx-auto flex max-w-2xl flex-col ${align} ${compactLayout}`
})

const iconWrapperClass = computed(() => {
  const size = props.compact ? 'h-10 w-10 rounded-2xl' : 'h-14 w-14 rounded-[20px]'
  return `flex shrink-0 items-center justify-center ${size} ${palette.value.iconWrapper}`
})

const iconClass = computed(() => (props.variant === 'loading' ? 'animate-spin' : ''))
const titleClass = computed(() => `text-base font-semibold ${palette.value.title}`)
const descriptionClass = computed(() => {
  const spacing = props.compact ? 'mt-1 text-sm leading-6' : 'mt-2 text-sm leading-6'
  return `${spacing} ${palette.value.description}`
})
const actionsClass = computed(() => {
  const alignment = props.centered ? 'justify-center' : 'justify-start'
  return `mt-4 flex flex-wrap gap-3 ${alignment}`
})
</script>
