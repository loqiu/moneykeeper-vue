<template>
  <div class="p-4" v-loading="loading">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
        <el-icon class="text-indigo-500"><List /></el-icon>
        收支明细
      </h2>
      <el-button 
        type="primary" 
        @click="handleDownloadExcel"
        size="small"
        class="!rounded-lg !bg-indigo-50 !text-indigo-600 !border-indigo-200 hover:!bg-indigo-100"
      >
        <el-icon class="mr-1"><Download /></el-icon>
        导出Excel
      </el-button>
    </div>
    
    <!-- 使用 v-if 确保数据加载后再渲染表格 -->
    <template v-if="!loading">
      <el-table 
        :data="records" 
        style="width: 100%" 
        :header-cell-style="{ background: '#f9fafb', color: '#6b7280', fontWeight: '600' }"
        row-class-name="hover:bg-gray-50 transition-colors"
      >
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <span 
              class="px-2 py-1 rounded-full text-xs font-medium"
              :class="scope.row.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
            >
              {{ scope.row.type === 'income' ? '收入' : '支出' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120">
           <template #default="scope">
             <div class="flex items-center gap-2">
               <span class="text-gray-700">{{ scope.row.category }}</span>
             </div>
           </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="scope">
            <span :class="scope.row.type === 'income' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'">
              {{ scope.row.type === 'income' ? '+' : '-' }}£{{ scope.row.amount }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="note" label="备注" show-overflow-tooltip>
          <template #default="scope">
            <span class="text-gray-500">{{ scope.row.note || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="scope">
            <div class="flex gap-2">
              <el-button
                size="small"
                type="primary"
                link
                @click="$emit('edit', scope.row)"
                class="!text-indigo-600 hover:!text-indigo-800"
              >
                修改
              </el-button>
              <el-button
                size="small"
                type="danger"
                link
                @click="$emit('delete', scope.row.id)"
                class="!text-red-500 hover:!text-red-700"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 只在有数据时显示分页 -->
      <div class="flex justify-center mt-6" v-if="pagination.total > 0">
        <el-pagination
          background
          :current-page="pagination.currentPage"
          :page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="$emit('size-change', $event)"
          @current-change="$emit('current-change', $event)"
          class="!font-normal"
        />
      </div>
      
      <div v-else class="text-center py-10 text-gray-400">
        暂无记录
      </div>
    </template>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, List } from '@element-plus/icons-vue'
import { downloadExcel } from '@/utils/downloadExcel'

const props = defineProps({
  loading: Boolean,
  records: Array,
  totalIncome: Number,
  totalExpense: Number,
  balance: Number,
  pagination: Object,
  userId: [String, Number]
})

defineEmits(['edit', 'delete', 'size-change', 'current-change'])

const handleDownloadExcel = () => {
  if (!props.records || props.records.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }
  downloadExcel(props.userId)
}
</script>

<style scoped>
/* TailwindCSS handles styling */
:deep(.el-table) {
  --el-table-border-color: #f3f4f6;
  --el-table-header-bg-color: #f9fafb;
}
:deep(.el-table__inner-wrapper::before) {
  display: none;
}
</style>