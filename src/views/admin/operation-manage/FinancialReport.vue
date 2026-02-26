<!-- src/views/admin/operation/FinancialReport.vue -->
<template>
  <div class="financial-report">
    <!-- 汇总卡片 -->
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="summary-card">
            <h3>总计</h3>
            <p>收入: ¥{{ summary.totalIncome?.toFixed(2) }}</p>
            <p>支出: ¥{{ summary.totalExpense?.toFixed(2) }}</p>
            <p :style="{ color: summary.netProfit >= 0 ? '#07C160' : '#F56C6C' }">
              利润: ¥{{ summary.netProfit?.toFixed(2) }}
            </p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="summary-card">
            <h3>本月</h3>
            <p>收入: ¥{{ summary.monthIncome?.toFixed(2) }}</p>
            <p>支出: ¥{{ summary.monthExpense?.toFixed(2) }}</p>
            <p :style="{ color: summary.monthProfit >= 0 ? '#07C160' : '#F56C6C' }">
              利润: ¥{{ summary.monthProfit?.toFixed(2) }}
            </p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="summary-card">
            <h3>本年</h3>
            <p>收入: ¥{{ summary.yearIncome?.toFixed(2) }}</p>
            <p>支出: ¥{{ summary.yearExpense?.toFixed(2) }}</p>
            <p :style="{ color: summary.yearProfit >= 0 ? '#07C160' : '#F56C6C' }">
              利润: ¥{{ summary.yearProfit?.toFixed(2) }}
            </p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20">
      <!-- 近12个月趋势 -->
      <el-col :span="12">
        <el-card shadow="never" v-loading="loading">
          <h3>近12个月收支趋势</h3>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 收入 & 支出分类占比 -->
      <el-col :span="6">
        <el-card shadow="never" v-loading="loading">
          <h3>收入分类占比</h3>
          <div ref="incomePieRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" v-loading="loading">
          <h3>支出分类占比</h3>
          <div ref="expensePieRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { getFinancialSummary, getFinancialByCategory } from '@/api/admin/operation'

// 分类中文映射（与 FinancialList 一致）
const categoryLabels = {
  tuition: '学费',
  rent: '租金',
  sale: '售卖',
  purchase: '采购',
  salary: '工资',
  other: '其他'
}

const summary = ref({})
const loading = ref(false)

// 图表实例
const trendChartRef = ref(null)
const incomePieRef = ref(null)
const expensePieRef = ref(null)

let trendChart = null
let incomePieChart = null
let expensePieChart = null

const loadSummary = async () => {
  loading.value = true
  try {
    const [summaryRes, categoryRes] = await Promise.all([
      getFinancialSummary(),
      getFinancialByCategory()
    ])

    if (summaryRes.code === 200 && categoryRes.code === 200) {
      // 合并数据
      summary.value = {
        ...summaryRes.data,
        incomeByCategory: categoryRes.data.incomeByCategory || [],
        expenseByCategory: categoryRes.data.expenseByCategory || []
      }
      renderCharts()
    } else {
      ElMessage.error('部分数据加载失败')
    }
  } catch (err) {
    console.error('加载财务报表失败:', err)
    ElMessage.error('加载财务报表失败')
  } finally {
    loading.value = false
  }
}

// 渲染所有图表
const renderCharts = () => {
  renderTrendChart()
  renderIncomePie()
  renderExpensePie()
}

// 1. 近12个月趋势图（折线图）
const renderTrendChart = () => {
  if (!trendChartRef.value) return
  trendChart?.dispose()
  trendChart = echarts.init(trendChartRef.value)

  const data = summary.value.monthlyTrend || []
  const months = data.map(item => item.month)
  const income = data.map(item => item.income)
  const expense = data.map(item => item.expense)

  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['收入', '支出'] },
    xAxis: { type: 'category', data: months },
    yAxis: { type: 'value', name: '金额（¥）' },
    series: [
      {
        name: '收入',
        type: 'line',
        data: income,
        smooth: true,
        lineStyle: { color: '#07C160' },
        itemStyle: { color: '#07C160' }
      },
      {
        name: '支出',
        type: 'line',
        data: expense,
        smooth: true,
        lineStyle: { color: '#F56C6C' },
        itemStyle: { color: '#F56C6C' }
      }
    ]
  }

  trendChart.setOption(option)
}

// 2. 收入分类饼图
const renderIncomePie = () => {
  if (!incomePieRef.value) return
  incomePieChart?.dispose()
  incomePieChart = echarts.init(incomePieRef.value)

  const data = summary.value.incomeByCategory || []
  const pieData = data
    .map(item => ({
      name: categoryLabels[item.category] || item.category,
      value: item.amount
    }))
    .filter(item => item.value > 0)

  if (pieData.length === 0) {
    const option = {
      series: [
        {
          name: '收入',
          type: 'pie',
          data: [{ name: '暂无数据', value: 1 }],
          label: { show: true, formatter: '暂无收入分类数据' }
        }
      ]
    }
    incomePieChart.setOption(option)
    return
  }

  const option = {
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: ¥{c} ({d}%)' },
    series: [
      {
        name: '收入',
        type: 'pie',
        radius: '60%',
        data: pieData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0,0,0,0.5)'
          }
        }
      }
    ]
  }

  incomePieChart.setOption(option)
}

// 3. 支出分类饼图
const renderExpensePie = () => {
  if (!expensePieRef.value) return
  expensePieChart?.dispose()
  expensePieChart = echarts.init(expensePieRef.value)

  const data = summary.value.expenseByCategory || []
  const pieData = data
    .map(item => ({
      name: categoryLabels[item.category] || item.category,
      value: item.amount
    }))
    .filter(item => item.value > 0)

  if (pieData.length === 0) {
    const option = {
      series: [
        {
          name: '支出',
          type: 'pie',
          data: [{ name: '暂无数据', value: 1 }],
          label: { show: true, formatter: '暂无支出分类数据' }
        }
      ]
    }
    expensePieChart.setOption(option)
    return
  }

  const option = {
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: ¥{c} ({d}%)' },
    series: [
      {
        name: '支出',
        type: 'pie',
        radius: '60%',
        data: pieData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0,0,0,0.5)'
          }
        }
      }
    ]
  }

  expensePieChart.setOption(option)
}

// 响应式 resize
const resizeCharts = () => {
  trendChart?.resize()
  incomePieChart?.resize()
  expensePieChart?.resize()
}

onMounted(() => {
  loadSummary()
  window.addEventListener('resize', resizeCharts)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts)
  trendChart?.dispose()
  incomePieChart?.dispose()
  expensePieChart?.dispose()
})
</script>

<style scoped>
.financial-report {
  padding: 20px;
}
.summary-card h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
}
.summary-card p {
  margin: 4px 0;
  font-size: 14px;
}
.chart-container {
  width: 100%;
  height: 300px;
}
</style>