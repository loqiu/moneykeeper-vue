<template>
  <div class="p-5 md:p-6" v-loading="loading">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <div class="flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
            <el-icon :size="22"><List /></el-icon>
          </div>
          <div>
            <h2 class="text-xl font-semibold text-slate-900">收支明细</h2>
            <p class="mt-1 text-sm text-slate-500">查看、编辑和导出当前筛选结果。</p>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          共 {{ pagination.total || 0 }} 条记录
        </span>
        <el-button
          type="primary"
          size="small"
          :disabled="!pagination.total || loading"
          class="!rounded-full !border-indigo-200 !bg-indigo-50 !px-4 !text-indigo-700 hover:!bg-indigo-100"
          @click="handleDownloadExcel"
        >
          <el-icon class="mr-1"><Download /></el-icon>
          导出 Excel
        </el-button>
      </div>
    </div>

    <div class="mt-5 grid gap-3 md:grid-cols-3">
      <div
        v-for="item in summaryCards"
        :key="item.label"
        class="rounded-3xl border p-4"
        :class="item.className"
      >
        <div class="text-sm text-slate-500">{{ item.label }}</div>
        <div class="mt-3 text-2xl font-semibold text-slate-900">{{ item.value }}</div>
      </div>
    </div>

    <template v-if="!loading && records.length > 0">
      <div class="mt-6 space-y-4 md:hidden">
        <article
          v-for="item in records"
          :key="item.id"
          class="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-sm font-medium text-slate-900">{{ item.categoryName || '未分类' }}</div>
              <div class="mt-1 text-xs text-slate-500">{{ item.date }}</div>
            </div>
            <span
              class="rounded-full px-2.5 py-1 text-xs font-semibold"
              :class="typeBadgeClass(item.type)"
            >
              {{ typeLabel(item.type) }}
            </span>
          </div>

          <div class="mt-4 text-3xl font-semibold" :class="amountClass(item.type)">
            {{ item.type === 'income' ? '+' : '-' }}{{ formatCurrency(item.amount) }}
          </div>

          <div class="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {{ item.note || '暂无备注' }}
          </div>

          <div class="mt-4 flex items-center justify-end gap-4 text-sm font-medium">
            <button type="button" class="text-indigo-600" @click="$emit('edit', item)">编辑</button>
            <button type="button" class="text-rose-600" @click="$emit('delete', item.id)">删除</button>
          </div>
        </article>
      </div>

      <div class="mt-6 hidden md:block overflow-hidden rounded-[28px] border border-slate-100">
        <el-table
          :data="records"
          style="width: 100%"
          :header-cell-style="{ background: '#f8fafc', color: '#64748b', fontWeight: '600' }"
          row-class-name="hover:bg-slate-50 transition-colors"
        >
          <el-table-column prop="date" label="日期" width="130" />
          <el-table-column prop="type" label="类型" width="110">
            <template #default="scope">
              <span class="rounded-full px-2.5 py-1 text-xs font-semibold" :class="typeBadgeClass(scope.row.type)">
                {{ typeLabel(scope.row.type) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="categoryName" label="分类" min-width="140">
            <template #default="scope">
              <span class="font-medium text-slate-700">{{ scope.row.categoryName || '未分类' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="金额" width="140">
            <template #default="scope">
              <span class="font-semibold" :class="amountClass(scope.row.type)">
                {{ scope.row.type === 'income' ? '+' : '-' }}{{ formatCurrency(scope.row.amount) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="note" label="备注" min-width="220" show-overflow-tooltip>
            <template #default="scope">
              <span class="text-slate-500">{{ scope.row.note || '暂无备注' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <div class="flex gap-2">
                <el-button
                  size="small"
                  type="primary"
                  link
                  class="!text-indigo-600 hover:!text-indigo-800"
                  @click="$emit('edit', scope.row)"
                >
                  编辑
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  link
                  class="!text-rose-500 hover:!text-rose-700"
                  @click="$emit('delete', scope.row.id)"
                >
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <p class="text-sm text-slate-500">
          当前第 {{ pagination.currentPage }} 页，每页 {{ pagination.pageSize }} 条。
        </p>
        <el-pagination
          v-if="pagination.total > 0"
          background
          :current-page="pagination.currentPage"
          :page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="$emit('size-change', $event)"
          @current-change="$emit('current-change', $event)"
        />
      </div>
    </template>

    <div
      v-else-if="!loading"
      class="mt-6 rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center"
    >
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-500">
        <el-icon :size="28"><WarningFilled /></el-icon>
      </div>
      <h3 class="mt-4 text-lg font-semibold text-slate-900">还没有匹配的记录</h3>
      <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        可以先添加一笔记录，或者调整左侧筛选条件后再试一次。
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, defineEmits, defineProps } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, List, WarningFilled } from '@element-plus/icons-vue'

const props = defineProps({
  loading: Boolean,
  records: {
    type: Array,
    default: () => []
  },
  totalIncome: {
    type: Number,
    default: 0
  },
  totalExpense: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    default: 0
  },
  pagination: {
    type: Object,
    required: true
  },
  userId: [String, Number]
})

defineEmits(['edit', 'delete', 'size-change', 'current-change'])

const formatCurrency = (value) => {
  return `£${Number(value || 0).toFixed(2)}`
}

const typeLabel = (type) => {
  return type === 'income' ? '收入' : '支出'
}

const typeBadgeClass = (type) => {
  return type === 'income'
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-rose-100 text-rose-700'
}

const amountClass = (type) => {
  return type === 'income' ? 'text-emerald-600' : 'text-rose-600'
}

const summaryCards = computed(() => ([
  {
    label: '总收入',
    value: formatCurrency(props.totalIncome),
    className: 'border-emerald-100 bg-emerald-50/70'
  },
  {
    label: '总支出',
    value: formatCurrency(props.totalExpense),
    className: 'border-rose-100 bg-rose-50/70'
  },
  {
    label: '结余',
    value: formatCurrency(props.balance),
    className: 'border-cyan-100 bg-cyan-50/70'
  }
]))

const handleDownloadExcel = async () => {
  if (!props.pagination.total) {
    ElMessage.warning('没有可导出的数据')
    return
  }

  try {
    const { downloadExcel } = await import('@/utils/downloadExcel')
    await downloadExcel(props.userId)
  } catch (error) {
    console.error('导出 Excel 失败:', error)
    ElMessage.error('导出失败，请稍后重试')
  }
}
</script>

<style scoped>
:deep(.el-table) {
  --el-table-border-color: #f1f5f9;
  --el-table-header-bg-color: #f8fafc;
}

:deep(.el-table__inner-wrapper::before) {
  display: none;
}

button {
  outline: none;
}
</style>