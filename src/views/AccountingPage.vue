<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6">
    <div class="max-w-7xl mx-auto space-y-6">
      <TopNavBar />
      
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-white tracking-tight drop-shadow-md">我的记账本</h1>
      </div>
      
      <!-- 主要内容区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 左侧：添加记录和筛选 -->
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 transition-all hover:shadow-2xl hover:bg-white/95">
            <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <el-icon class="text-indigo-500"><Plus /></el-icon>
              记一笔
            </h2>
            <AddRecordForm
              v-model:new-record="newRecord"
              :expense-categories="expenseCategories"
              :income-categories="incomeCategories"
              @add-record="addRecord"
              @delete-category="handleDeleteCategory"
              @show-add-category-dialog="showAddCategoryDialog"
            />
          </div>

          <div class="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 transition-all hover:shadow-2xl hover:bg-white/95">
            <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <el-icon class="text-purple-500"><Filter /></el-icon>
              筛选记录
            </h2>
            <CategoryFilter />
          </div>
        </div>

        <!-- 右侧：统计图表和列表 -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 统计卡片 -->
          <div class="grid grid-cols-3 gap-4">
            <div class="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg p-4 flex flex-col items-center justify-center hover:scale-105 transition-transform">
              <span class="text-gray-500 text-sm mb-1">总收入</span>
              <span class="text-2xl font-bold text-green-500">£{{ totalIncome }}</span>
            </div>
            <div class="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg p-4 flex flex-col items-center justify-center hover:scale-105 transition-transform">
              <span class="text-gray-500 text-sm mb-1">总支出</span>
              <span class="text-2xl font-bold text-red-500">£{{ totalExpense }}</span>
            </div>
            <div class="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg p-4 flex flex-col items-center justify-center hover:scale-105 transition-transform">
              <span class="text-gray-500 text-sm mb-1">结余</span>
              <span class="text-2xl font-bold text-indigo-600">£{{ balance }}</span>
            </div>
          </div>

          <!-- 图表区域 -->
          <div class="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
            <AccountingCharts
              :loading="loading"
              :pie-option="pieOption"
              :line-option="lineOption"
              :bar-option="barOption"
              v-model:time-unit="timeUnit"
              v-model:selected-category="selectedCategory"
            />
          </div>

          <!-- 记录列表 -->
          <div class="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden">
            <RecordsList
              :loading="loading"
              :records="records"
              :total-income="totalIncome"
              :total-expense="totalExpense"
              :balance="balance"
              :pagination="pagination"
              :user-id="userStore.userId"
              @edit="startEdit"
              @delete="deleteRecord"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>

      <!-- 添加编辑记录对话框 -->
      <EditRecordDialog
        v-model="showEditDialog"
        v-model:record="editingRecord"
        :expense-categories="expenseCategories"
        :income-categories="incomeCategories"
        @cancel="cancelEdit"
        @save="saveEdit"
      />

      <!-- 添加新分类对话框 -->
      <AddCategoryDialog
        v-model="dialogVisible"
        :category-type="categoryType"
        :available-icons="availableIcons"
        @add="addCategory"
      />

      <AiChatBox />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAccounting } from '@/composables/useAccounting'
import TopNavBar from '@/components/TopNavBar.vue'
import AddRecordForm from '@/components/AddRecordForm.vue'
import RecordsList from '@/components/RecordsList.vue'
import AccountingCharts from '@/components/AccountingCharts.vue'
import { useUserStore } from '@/stores/user'
import EditRecordDialog from '@/components/EditRecordDialog.vue'
import AddCategoryDialog from '@/components/AddCategoryDialog.vue'
import AiChatBox from '@/components/AiChatBox.vue'
import CategoryFilter from '@/components/CategoryFilter.vue'
import { Plus, Filter } from '@element-plus/icons-vue'

const userStore = useUserStore()

const {
  newRecord,
  timeUnit,
  totalIncome,
  totalExpense,
  balance,
  pieOption,
  lineOption,
  barOption,
  addRecord,
  expenseCategories,
  incomeCategories,
  deleteRecord,
  editingRecord,
  showEditDialog,
  startEdit,
  cancelEdit,
  saveEdit,
  fetchRecords,
  dialogVisible,
  categoryType,
  availableIcons,
  showAddCategoryDialog,
  deleteCategory,
  addCategory,
  pagination,
  handleCurrentChange,
  handleSizeChange,
  loading,
  fetchCategories,
  records,
  selectedCategory
} = useAccounting()

const handleDeleteCategory = async (payload) => {
  await deleteCategory(payload)
}

onMounted(async () => {
  if (userStore.userId) {
    await Promise.all([
      fetchRecords(),
      fetchCategories()
    ])
  }
})
</script>

<style scoped>
/* 移除旧的 CSS 引用，使用 TailwindCSS */
:deep(.el-card) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.3);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.5);
}
</style>