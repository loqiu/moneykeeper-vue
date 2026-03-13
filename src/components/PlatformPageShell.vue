<template>
  <div class="relative min-h-screen overflow-hidden bg-[linear-gradient(160deg,#fff7ed_0%,#f8fafc_42%,#ecfeff_100%)] px-4 py-6 sm:px-6 lg:px-8">
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="absolute -left-16 top-16 h-56 w-56 rounded-full bg-amber-200/35 blur-3xl"></div>
      <div class="absolute right-0 top-0 h-72 w-72 rounded-full bg-cyan-200/35 blur-3xl"></div>
      <div class="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl"></div>
    </div>

    <div class="relative mx-auto max-w-7xl space-y-6">
      <TopNavBar />

      <section class="overflow-hidden rounded-[32px] bg-slate-900 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
        <div class="relative isolate px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div class="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.30),transparent_48%),radial-gradient(circle_at_bottom,rgba(45,212,191,0.26),transparent_44%)]"></div>
          <div class="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div class="max-w-3xl space-y-4">
              <div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-slate-100 backdrop-blur">
                <span>{{ eyebrow }}</span>
              </div>
              <div class="space-y-3">
                <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">{{ title }}</h1>
                <p class="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                  {{ description }}
                </p>
              </div>
            </div>

            <div v-if="$slots.summary" class="min-w-0 lg:max-w-sm">
              <slot name="summary" />
            </div>
          </div>
        </div>
      </section>

      <div v-if="$slots.aside" class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section class="rounded-[32px] border border-white/70 bg-white/92 p-6 shadow-[0_20px_60px_rgba(148,163,184,0.16)] backdrop-blur">
          <slot />
        </section>

        <aside class="space-y-6">
          <slot name="aside" />
        </aside>
      </div>

      <section
        v-else
        class="rounded-[32px] border border-white/70 bg-white/92 p-6 shadow-[0_20px_60px_rgba(148,163,184,0.16)] backdrop-blur"
      >
        <slot />
      </section>
    </div>
  </div>
</template>

<script setup>
/* global defineProps */
import TopNavBar from '@/components/TopNavBar.vue'

defineProps({
  eyebrow: {
    type: String,
    default: 'Platform Workspace'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
})
</script>
