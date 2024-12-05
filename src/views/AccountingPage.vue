<template>
    <div class="accounting-container">
      <!-- 原有内容不需要 v-if="isLoggedIn" 包裹 -->
      <el-row>
        <el-col :span="24">
          <h1 class="page-title">我的记账本</h1>
        </el-col>
      </el-row>
      
      <!-- 添加新记录表单 -->
      <el-card class="form-section" :body-style="{ padding: '20px' }">
        <template #header>
          <div class="card-header">
            <h2>添加新记录</h2>
          </div>
        </template>
        
        <el-form :model="newRecord" class="add-record-form">
          <div class="form-content">
            <el-form-item label="类型" class="form-item">
              <el-select v-model="newRecord.type" class="form-input">
                <el-option label="支出" value="expense" />
                <el-option label="收入" value="income" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="金额" class="form-item">
              <el-input-number 
                v-model="newRecord.amount" 
                :min="0" 
                :precision="2" 
                :step="0.01"
                class="form-input"
              />
            </el-form-item>
            
            <el-form-item label="分类" class="form-item">
              <div class="category-icons">
                <template v-if="newRecord.type === 'expense'">
                  <el-tooltip
                    v-for="(item, index) in expenseCategories"
                    :key="index"
                    :content="item.name"
                    placement="top"
                  >
                    <el-button
                      :class="{ active: newRecord.category === item.id }"
                      class="icon-button"
                      circle
                      @click="handleCategorySelect(item)"
                      :style="{ backgroundColor: item.bgColor || '#f5f5f5' }"
                    >
                      <el-icon><Icon :icon="item.icon" /></el-icon>
                      <span class="delete-icon" @click.stop="deleteCategory(index, 'expense')">
                        <el-icon><Close /></el-icon>
                      </span>
                    </el-button>
                  </el-tooltip>
                  <el-tooltip content="添加新分类" placement="top">
                    <el-button
                      class="icon-button add-button"
                      circle
                      @click="showAddCategoryDialog(newRecord.type)"
                    >
                      <el-icon><Plus /></el-icon>
                    </el-button>
                  </el-tooltip>
                </template>
                <template v-else>
                  <el-tooltip
                    v-for="(item, index) in incomeCategories"
                    :key="index"
                    :content="item.name"
                    placement="top"
                  >
                    <el-button
                      :class="{ active: newRecord.category === item.id }"
                      class="icon-button"
                      circle
                      @click="handleCategorySelect(item)"
                      :style="{ backgroundColor: item.bgColor || '#f5f5f5' }"
                    >
                      <el-icon><Icon :icon="item.icon" /></el-icon>
                      <span class="delete-icon" @click.stop="deleteCategory(index, 'income')">
                        <el-icon><Close /></el-icon>
                      </span>
                    </el-button>
                  </el-tooltip>
                  <el-tooltip content="添加新分类" placement="top">
                    <el-button
                      class="icon-button add-button"
                      circle
                      @click="showAddCategoryDialog(newRecord.type)"
                    >
                      <el-icon><Plus /></el-icon>
                    </el-button>
                  </el-tooltip>
                </template>
              </div>
            </el-form-item>
            
            <el-form-item label="日期" class="form-item">
              <el-date-picker
                v-model="newRecord.date"
                type="date"
                placeholder="选择日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :default-value="new Date()"
                class="form-input"
              />
            </el-form-item>
            
            <el-form-item label="备注" class="form-item">
              <el-input 
                v-model="newRecord.note" 
                class="form-input"
                placeholder="请输入备注"
                maxlength="255"
                show-word-limit
              />
            </el-form-item>
            
            <el-button type="primary" @click="handleAddRecord" class="submit-button">
              添加记录
            </el-button>
          </div>
        </el-form>
      </el-card>
    
      <!-- 收支记录列表 -->
      <el-card class="records-section" :body-style="{ padding: '20px' }" v-loading="loading">
        <template #header>
          <div class="card-header">
            <h2>收支记录</h2>
          </div>
        </template>
        
        <el-row class="summary">
          <el-col :span="8">
            <div class="statistic-card">
              <el-statistic title="总收入" :value="totalIncome" prefix="¥">
                <template #title>
                  <div class="statistic-title">总收入</div>
                </template>
              </el-statistic>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="statistic-card">
              <el-statistic title="总支出" :value="totalExpense" prefix="¥">
                <template #title>
                  <div class="statistic-title">总支出</div>
                </template>
              </el-statistic>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="statistic-card">
              <el-statistic title="结余" :value="balance" prefix="¥">
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
                  ¥{{ scope.row.amount }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="note" label="备注" />
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button
                  size="small"
                  type="primary"
                  @click="startEdit(scope.row)"
                >
                  修改
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  @click="deleteRecord(scope.row.id)"
                >
                  删除
                </el-button>
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
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </template>
      </el-card>
    
      <!-- 数据可视化部分 -->
      <el-row :gutter="20" class="charts-section">
        <!-- 分类饼图 -->
        <el-col :span="8">
          <el-card class="chart-card" :body-style="{ padding: '20px' }">
            <template #header>
              <h3>支出分类占比</h3>
            </template>
            <div class="chart-container">
              <v-chart class="chart" :option="pieOption" autoresize />
            </div>
          </el-card>
        </el-col>
        
        <!-- 支出趋势图 -->
        <el-col :span="8">
          <el-card class="chart-card" :body-style="{ padding: '20px' }">
            <template #header>
              <h3>支出趋势</h3>
            </template>
            <div class="chart-container">
              <v-chart class="chart" :option="lineOption" autoresize />
            </div>
          </el-card>
        </el-col>
        
        <!-- 月度统计图 -->
        <el-col :span="8">
          <el-card class="chart-card" :body-style="{ padding: '20px' }">
            <template #header>
              <div class="chart-header">
                <h3>年度统计</h3>
                <el-radio-group v-model="timeUnit" size="small">
                  <el-radio-button label="year">年</el-radio-button>
                  <el-radio-button label="month">月</el-radio-button>
                  <el-radio-button label="day">日</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div class="chart-container">
              <v-chart class="chart" :option="barOption" autoresize />
            </div>
          </el-card>
        </el-col>
      </el-row>
    
      <!-- 添加修改记录的对话框 -->
      <el-dialog
        v-model="showEditDialog"
        title="修改记录"
        width="30%"
        :close-on-click-modal="false"
      >
        <el-form v-if="editingRecord" label-width="80px">
          <el-form-item label="类型">
            <el-select v-model="editingRecord.type">
              <el-option label="支出" value="expense" />
              <el-option label="收入" value="income" />
            </el-select>
          </el-form-item>

          <el-form-item label="金额">
            <el-input-number 
              v-model="editingRecord.amount" 
              :min="0" 
              :precision="2" 
              :step="0.01"
            />
          </el-form-item>

          <el-form-item label="分类">
            <div class="category-icons">
              <template v-if="editingRecord.type === 'expense'">
                <el-tooltip
                  v-for="(item, index) in expenseCategories"
                  :key="index"
                  :content="item.name"
                  placement="top"
                >
                  <el-button
                    :class="{ active: editingRecord.category === item.id }"
                    class="icon-button"
                    circle
                    @click="editingRecord.category = item.id"
                    :style="{ backgroundColor: item.bgColor || '#f5f5f5' }"
                  >
                    <el-icon><Icon :icon="item.icon" /></el-icon>
                  </el-button>
                </el-tooltip>
              </template>
              <template v-else>
                <el-tooltip
                  v-for="(item, index) in incomeCategories"
                  :key="index"
                  :content="item.name"
                  placement="top"
                >
                  <el-button
                    :class="{ active: editingRecord.category === item.id }"
                    class="icon-button"
                    circle
                    @click="editingRecord.category = item.id"
                    :style="{ backgroundColor: item.bgColor || '#f5f5f5' }"
                  >
                    <el-icon><Icon :icon="item.icon" /></el-icon>
                  </el-button>
                </el-tooltip>
              </template>
            </div>
          </el-form-item>

          <el-form-item label="日期">
            <el-date-picker
              v-model="editingRecord.date"
              type="date"
              placeholder="选择日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>

          <el-form-item label="备注">
            <el-input 
              v-model="editingRecord.note" 
              maxlength="255"
              show-word-limit
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="cancelEdit">取消</el-button>
            <el-button type="primary" @click="saveEdit">确定</el-button>
          </span>
        </template>
      </el-dialog>
    
      <!-- 添加新分类的对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="`添加${categoryType === 'expense' ? '支出' : '收入'}分类`"
        width="30%"
      >
        <el-form :model="newCategory">
          <el-form-item label="分类名称">
            <el-input v-model="newCategory.name" />
          </el-form-item>
          <el-form-item label="图标">
            <el-select v-model="newCategory.icon" style="width: 100%">
              <el-option
                v-for="icon in availableIcons"
                :key="icon.value"
                :label="icon.label"
                :value="icon.label"
              >
                <div style="display: flex; align-items: center;">
                  <el-icon style="margin-right: 8px; font-size: 18px;">
                    <component :is="icon.value" />
                  </el-icon>
                  <span>{{ icon.label }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="addCategory(newCategory)">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { onMounted } from 'vue'
  import { useAccounting } from '@/composables/useAccounting'
  import '@/assets/styles/accounting.css'
  import { use } from 'echarts/core'
  import { CanvasRenderer } from 'echarts/renderers'
  import {
    PieChart,
    LineChart,
    BarChart
  } from 'echarts/charts'
  import {
    GridComponent,
    TooltipComponent,
    LegendComponent,
    TitleComponent
  } from 'echarts/components'
  import VChart from 'vue-echarts'
  import * as ElementPlusIconsVue from '@element-plus/icons-vue'
  import { h } from 'vue'
  import { Close, Plus } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  
  // 注册必需的 ECharts 组件
  use([
    CanvasRenderer,
    PieChart,
    LineChart,
    BarChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    TitleComponent
  ])
  
  // 注册所有图标组件
  const Icon = (props) => {
    const { icon } = props
    return h(ElementPlusIconsVue[icon])
  }
  
  const {
    records,
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
    newCategory,
    showAddCategoryDialog,
    deleteCategory,
    addCategory,
    pagination,
    handleCurrentChange,
    handleSizeChange,
    loading,
    fetchCategories
  } = useAccounting()

  // 修改页面加载时的逻辑
  onMounted(async () => {
    await Promise.all([
      fetchRecords(),
      fetchCategories()
    ])
  })

  // 添加分类选择处理函数
  const handleCategorySelect = (category) => {
    newRecord.value.category = category.id  // 存储分类ID
    newRecord.value.categoryName = category.name  // 存储分类名称，用于显示
  }

  // 添加处理添加记录的方法
  const handleAddRecord = () => {
    // 检查必填字段
    if (!newRecord.value.amount || !newRecord.value.category) {
      ElMessage.warning('请填写完整的记账信息')
      return
    }

    // 调用添加记录方法
    addRecord(newRecord.value)
  }
  </script>
  
  <style lang="scss">
  @import '@/assets/styles/accounting.css';
  </style> 