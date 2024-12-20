import { computed, watch, ref,  nextTick } from 'vue' //onMounted, onUnmounted,
import { useCategory } from './useCategory'
import { useRecord } from './useRecord'
import { useUserStore } from '@/stores/user'

export function useAccounting() {
  const category = useCategory()
  const record = useRecord()
  const userStore = useUserStore()
  const timeUnit = ref('day')

  // 监听用户登录状态
  watch(() => userStore.userId, async (newUserId) => {
    if (newUserId) {
      await Promise.all([
        record.fetchRecords(),
        category.fetchCategories()
      ])
    }
  })

  // 添加选中的分类状态
  const selectedCategory = ref(null)

  // 图表配置
  const pieOption = computed(() => {
    if (!record.allRecords.value) return {} // 添加空值检查

    const categoryData = record.allRecords.value
      .filter(record => record.type === 'expense')
      .reduce((acc, record) => {
        acc[record.category] = (acc[record.category] || 0) + record.amount
        return acc
      }, {})

    return {
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          // 格式化金额，保留2位小数
          const amount = Number(params.value).toFixed(2)
          return `${params.name}: £${amount} (${params.percent}%)`
        }
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center'
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: (params) => {
            // 格式化金额，保留2位小数
            const amount = Number(params.value).toFixed(2)
            return `${params.name}: £${amount}`
          }
        },
        data: Object.entries(categoryData).map(([name, value]) => ({
          name,
          value
        })),
        // 添加点击事件
        emphasis: {
          scale: true,
          scaleSize: 10
        }
      }]
    }
  })

  // 处理饼图点击
  const handlePieClick = (params) => {
    const categoryData = record.allRecords.value
      .find(record => record.categoryName === params.name)
    
    if (categoryData) {
      if (categoryData.category === selectedCategory.value) {
        // 如果点击已选中的分类，取消筛选
        selectedCategory.value = null
      } else {
        // 选中新的分类，存储分类ID
        selectedCategory.value = categoryData.category
      }
    }
  }

  // 修改记录列表，添加筛选
  const filteredRecords = computed(() => {
    if (!selectedCategory.value || !record.records.value) {
      return record.records.value
    }
    return record.records.value.filter(item => 
      item.category === selectedCategory.value
    )
  })

  const lineOption = computed(() => {
    if (!record.allRecords.value) return {} // 添加空值检查
    
    const dateMap = record.allRecords.value
      .filter(record => record.type === 'expense')
      .reduce((acc, record) => {
        acc[record.date] = (acc[record.date] || 0) + record.amount
        return acc
      }, {})

    const dates = Object.keys(dateMap).sort()
    const values = dates.map(date => dateMap[date])

    return {
      tooltip: {
        trigger: 'axis',
        formatter: '{b}<br />支出: £{c}'
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '£{value}'
        }
      },
      series: [{
        data: values,
        type: 'line',
        smooth: true,
        areaStyle: {}
      }]
    }
  })

  const barOption = computed(() => {
    if (!record.allRecords.value) return {} // 添加空值检查
    const timeData = record.allRecords.value.reduce((acc, record) => {
      const date = new Date(record.date)
      let key
      
      switch(timeUnit.value) {
        case 'year':
          key = date.getFullYear().toString()
          break
        case 'month':
          key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
          break
        case 'day':
          key = record.date
          break
        default:
          key = record.date
          break
      }
      
      if (!acc[key]) acc[key] = { income: 0, expense: 0 }
      if (record.type === 'income') {
        acc[key].income += record.amount
      } else {
        acc[key].expense += record.amount
      }
      return acc
    }, {})

    const times = Object.keys(timeData).sort()
    const incomeData = times.map(time => timeData[time].income)
    const expenseData = times.map(time => timeData[time].expense)

    return {
      tooltip: {
        trigger: 'axis',
        formatter: function(params) {
          return `${params[0].name}<br/>
                 收入: £${params[0].value}<br/>
                 支出: £${params[1].value}`
        }
      },
      legend: {
        data: ['收入', '支出']
      },
      xAxis: {
        type: 'category',
        data: times,
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '£{value}'
        }
      },
      series: [
        {
          name: '收入',
          type: 'bar',
          data: incomeData,
          itemStyle: {
            color: '#67C23A'
          }
        },
        {
          name: '支出',
          type: 'bar',
          data: expenseData,
          itemStyle: {
            color: '#F56C6C'
          }
        }
      ]
    }
  })

  const pieChartRef = ref(null)
  const lineChartRef = ref(null)
  const barChartRef = ref(null)

  // 监听窗口大小变化
  // const handleResize = () => {
  //   nextTick(() => {
  //     pieChartRef.value?.resize()
  //     lineChartRef.value?.resize()
  //     barChartRef.value?.resize()
  //   })
  // }

  // 监听数据变化，手动更新图表
  watch([pieOption, lineOption, barOption], () => {
    nextTick(() => {
      pieChartRef.value?.setOption(pieOption.value)
      lineChartRef.value?.setOption(lineOption.value)
      barChartRef.value?.setOption(barOption.value)
    })
  }, { deep: true })

  // onMounted(() => {
  //   window.addEventListener('resize', handleResize)
  //   handleResize() // 初始化时调用一次
  // })

  // onUnmounted(() => {
  //   window.removeEventListener('resize', handleResize)
  // })

  return {
    ...category,
    ...record,
    timeUnit,
    pieOption,
    lineOption,
    barOption,
    filteredRecords,
    handlePieClick,
    selectedCategory,
    pieChartRef,
    lineChartRef,
    barChartRef
  }
}