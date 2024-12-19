<template>
  <el-card class="records-section" :body-style="{ padding: '20px' }" v-loading="loading">
    <template #header>
      <div class="card-header">
        <h2>收支记录</h2>
        <el-button 
          type="primary" 
          @click="handleDownloadExcel"
          class="download-excel-button"
          size="small"
        >
          <el-icon class="download-icon"><Download /></el-icon>
          <span>导出Excel</span>
        </el-button>
      </div>
    </template>
    
    <el-row class="summary">
      <el-col :span="8">
        <div class="statistic-card">
          <el-statistic :value="totalIncome" prefix="£">
            <template #title>
              <div class="statistic-title">总收入</div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="statistic-card">
          <el-statistic :value="totalExpense" prefix="£">
            <template #title>
              <div class="statistic-title">总支出</div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="statistic-card">
          <el-statistic :value="balance" prefix="£">
            <template #title>
              <div class="statistic-title">结余</div>
            </template>
          </el-statistic>
        </div>
      </el-col>
    </el-row>
    
    <!-- 使用 v-if 确保数据加载后再渲染表格 -->
    <template v-if="!loading">
      <el-table :data="records" style="width: 100%">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.type === 'income' ? 'success' : 'danger'">
              {{ scope.row.type === 'income' ? '收入' : '支出' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="scope">
            <span :class="scope.row.type === 'income' ? 'income' : 'expense'">
              £{{ scope.row.amount }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="note" label="备注" />
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <div class="operation-buttons">
              <el-button
                size="small"
                type="primary"
                @click="$emit('edit', scope.row)"
                class="operation-button"
              >
                修改
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="$emit('delete', scope.row.id)"
                class="operation-button"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 只在有数据时显示分页 -->
      <div class="pagination-container" v-if="pagination.total > 0">
        <el-pagination
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
  </el-card>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
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

<style src="@/assets/styles/recordsList.css" scoped></style> 