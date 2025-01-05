<template>
  <div class="accounting-container">
    <TopNavBar />
    
    <el-row>
      <el-col :span="24">
        <h1 class="page-title">我的记账本</h1>
      </el-col>
    </el-row>
    
    <AddRecordForm
      v-model:new-record="newRecord"
      :expense-categories="expenseCategories"
      :income-categories="incomeCategories"
      @add-record="addRecord"
      @delete-category="handleDeleteCategory"
      @show-add-category-dialog="showAddCategoryDialog"
    />
    
    <RecordsList
      :loading="loading"
      :records="filteredRecords"
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
    
    <AccountingCharts
      :loading="loading"
      :pie-option="pieOption"
      :line-option="lineOption"
      :bar-option="barOption"
      v-model:time-unit="timeUnit"
      v-model:selected-category="selectedCategory"
    />

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
</template>

<script setup>
import { onMounted } from 'vue'
import { useAccounting } from '@/composables/useAccounting'
import '@/assets/styles/accounting.css'
import TopNavBar from '@/components/TopNavBar.vue'
import AddRecordForm from '@/components/AddRecordForm.vue'
import RecordsList from '@/components/RecordsList.vue'
import AccountingCharts from '@/components/AccountingCharts.vue'
import { useUserStore } from '@/stores/user'
import EditRecordDialog from '@/components/EditRecordDialog.vue'
import AddCategoryDialog from '@/components/AddCategoryDialog.vue'
import AiChatBox from '@/components/AiChatBox.vue'

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
  filteredRecords,
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

<style lang="scss">
@import '@/assets/styles/accounting.css';
</style>