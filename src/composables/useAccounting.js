import { computed, watch, ref, nextTick } from 'vue'
import { useCategory } from './useCategory'
import { useRecord } from './useRecord'
import { useLedgerStore } from '@/stores/ledger'
import { useUserStore } from '@/stores/user'

export function useAccounting() {
  const category = useCategory()
  const record = useRecord()
  const userStore = useUserStore()
  const ledgerStore = useLedgerStore()
  const timeUnit = ref('day')

  watch(
    [
      () => userStore.userId,
      () => ledgerStore.currentLedgerId
    ],
    async ([newUserId, newLedgerId], [, oldLedgerId]) => {
      if (!newUserId || !newLedgerId) {
        return
      }

      if (newLedgerId !== oldLedgerId) {
        record.setFilter('', '')
      }

      await Promise.all([
        record.fetchRecords(),
        category.fetchCategories()
      ])
    }
  )

  const selectedCategory = computed({
    get: () => {
      if (record.filterState.value.type !== 'expense') {
        return ''
      }

      return record.filterState.value.category
    },
    set: (value) => {
      if (value) {
        record.setFilter('expense', value)
        return
      }

      record.setFilter('', '')
    }
  })

  const pieOption = computed(() => {
    if (!record.allRecords.value) return {}

    const categoryData = record.allRecords.value
      .filter((item) => item.type === 'expense')
      .reduce((acc, item) => {
        const categoryName = item.categoryName || '未分类'
        acc[categoryName] = (acc[categoryName] || 0) + item.amount
        return acc
      }, {})

    return {
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
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
            const amount = Number(params.value).toFixed(2)
            return `${params.name}: £${amount}`
          }
        },
        data: Object.entries(categoryData).map(([name, value]) => ({
          name,
          value
        })),
        emphasis: {
          scale: true,
          scaleSize: 10
        }
      }]
    }
  })

  const lineOption = computed(() => {
    if (!record.allRecords.value) return {}

    const dateMap = record.allRecords.value
      .filter((item) => item.type === 'expense')
      .reduce((acc, item) => {
        acc[item.date] = (acc[item.date] || 0) + item.amount
        return acc
      }, {})

    const dates = Object.keys(dateMap).sort()
    const values = dates.map((date) => dateMap[date])

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
    if (!record.allRecords.value) return {}

    const timeData = record.allRecords.value.reduce((acc, item) => {
      const date = new Date(item.date)
      let key

      switch (timeUnit.value) {
        case 'year':
          key = date.getFullYear().toString()
          break
        case 'month':
          key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
          break
        case 'day':
        default:
          key = item.date
          break
      }

      if (!acc[key]) {
        acc[key] = { income: 0, expense: 0 }
      }

      if (item.type === 'income') {
        acc[key].income += item.amount
      } else {
        acc[key].expense += item.amount
      }

      return acc
    }, {})

    const times = Object.keys(timeData).sort()
    const incomeData = times.map((time) => timeData[time].income)
    const expenseData = times.map((time) => timeData[time].expense)

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          return `${params[0].name}<br/>收入: £${params[0].value}<br/>支出: £${params[1].value}`
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

  watch([pieOption, lineOption, barOption], () => {
    nextTick(() => {
      pieChartRef.value?.setOption(pieOption.value)
      lineChartRef.value?.setOption(lineOption.value)
      barChartRef.value?.setOption(barOption.value)
    })
  }, { deep: true })

  return {
    ...category,
    ...record,
    timeUnit,
    selectedCategory,
    pieOption,
    lineOption,
    barOption,
    pieChartRef,
    lineChartRef,
    barChartRef
  }
}
