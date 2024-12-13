import { computed, watch } from 'vue'
import { useCategory } from './useCategory'
import { useRecord } from './useRecord'
import { useUserStore } from '@/stores/user'

export function useAccounting() {
  const category = useCategory()
  const record = useRecord()
  const userStore = useUserStore()

  // 监听用户登录状态
  watch(() => userStore.userId, async (newUserId) => {
    if (newUserId) {
      await Promise.all([
        record.fetchRecords(),
        category.fetchCategories()
      ])
    }
  })

  // 图表配置
  const pieOption = computed(() => {
    const categoryData = record.allRecords.value
      .filter(record => record.type === 'expense')
      .reduce((acc, record) => {
        acc[record.category] = (acc[record.category] || 0) + record.amount
        return acc
      }, {})

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: ¥{c} ({d}%)'
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
          formatter: '{b}: ¥{c}'
        },
        data: Object.entries(categoryData).map(([name, value]) => ({
          name,
          value
        }))
      }]
    }
  })

  const lineOption = computed(() => {
    const dateMap = record.records.value
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
        formatter: '{b}<br />支出: ¥{c}'
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
          formatter: '¥{value}'
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
    const timeData = record.records.value.reduce((acc, record) => {
      const date = new Date(record.date)
      let key
      
      switch(record.timeUnit) {
        case 'year':
          key = date.getFullYear().toString()
          break
        case 'month':
          key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
          break
        case 'day':
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
                 收入: ¥${params[0].value}<br/>
                 支出: ¥${params[1].value}`
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
          formatter: '¥{value}'
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

  return {
    ...category,
    ...record,
    pieOption,
    lineOption,
    barOption
  }
}