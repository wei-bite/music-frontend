<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { useUserStore } from '@/stores'

const userStore = useUserStore()
const role = userStore.role

// === 核心数据状态 ===
const stats = ref({
  totalUsers: 128,
  totalCourses: 24,
  totalInstruments: 56,
  pendingApprovals: 3,
  totalRevenue: 86420,
  totalExpenses: 32500,
  // lowStockCount: 5
})

// === 日期筛选 ===
const dateRange = ref([])

// === 图表实例 ===
let userChart = null
let courseChart = null
let revenueChart = null
let instrumentChart = null

// === 初始化图表 ===
const initCharts = () => {
  // 收入支出趋势图
  const revenueChartDom = document.getElementById('revenue-chart')
  if (revenueChartDom) {
    revenueChart = echarts.init(revenueChartDom)
    revenueChart.setOption({
      title: { text: '收支趋势', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'axis' },
      legend: { data: ['收入', '支出'], bottom: 0 },
      grid: { top: 30, left: 50, right: 20, bottom: 40 },
      xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
      yAxis: { type: 'value' },
      series: [
        { name: '收入', type: 'bar', data: [12000, 15000, 18000, 22000, 25000, 28000], itemStyle: { color: '#5470C6' } },
        { name: '支出', type: 'bar', data: [8000, 9500, 11000, 13000, 14500, 16000], itemStyle: { color: '#EE6666' } }
      ]
    })
  }

  // 乐器库存分布图
  const instrumentChartDom = document.getElementById('instrument-chart')
  if (instrumentChartDom) {
    instrumentChart = echarts.init(instrumentChartDom)
    instrumentChart.setOption({
      title: { text: '乐器库存', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'item' },
      legend: { show: false },
      series: [{
        type: 'pie',
        radius: ['40%', '60%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        label: { show: true, formatter: '{b}\n{d}%' },
        labelLine: { show: true },
        data: [
          { value: 30, name: '钢琴' },
          { value: 25, name: '吉他' },
          { value: 15, name: '小提琴' },
          { value: 8, name: '库存不足' }
        ]
      }]
    })
  }

  // 用户增长趋势图
  const userChartDom = document.getElementById('user-chart')
  if (userChartDom) {
    userChart = echarts.init(userChartDom)
    userChart.setOption({
      title: { text: '用户增长', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'axis' },
      grid: { top: 30, left: 40, right: 20, bottom: 40 },
      xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月','7月', '8月', '9月', '10月', '11月', '12月'] },
      yAxis: { type: 'value' },
      series: [{
        data: [80, 95, 110, 120, 125, 128, 130, 135, 140, 145, 150, 155],
        type: 'line',
        smooth: true,
        areaStyle: {},
        itemStyle: { color: '#91CC75' }
      }]
    })
  }

  // 课程类型分布图
  const courseChartDom = document.getElementById('course-chart')
  if (courseChartDom) {
    courseChart = echarts.init(courseChartDom)
    courseChart.setOption({
      title: { text: '课程分布', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'item' },
      legend: { show: false },
      series: [{
        type: 'pie',
        radius: ['40%', '60%'],
        center: ['50%', '50%'],
        label: { show: true, formatter: '{b}\n{d}%' },
        data: [
          { value: 8, name: '钢琴' },
          { value: 6, name: '吉他' },
          { value: 4, name: '小提琴' },
          { value: 3, name: '声乐' },
          { value: 3, name: '架子鼓' }
        ]
      }]
    })
  }
}

// === 工具函数：指标卡标题映射 ===
const getStatLabel = (key) => {
  return key === 'totalUsers' ? '用户总数' :
         key === 'totalCourses' ? '课程总数' :
         key === 'totalInstruments' ? '乐器总数' :
        key === 'totalRevenue' ? '总收入' :
          key === 'totalExpenses' ? '总支出' :
         '待审批事项'
}

// === 日期筛选处理 ===
const handleDateChange = (val) => {
  console.log('日期范围:', val)
}

// === 生命周期 ===
onMounted(() => {
  if (role === 'admin') {
    initCharts()
    window.addEventListener('resize', handleResize)
  }
})

const handleResize = () => {
  userChart?.resize()
  courseChart?.resize()
  revenueChart?.resize()
  instrumentChart?.resize()
}

onUnmounted(() => {
  if (role === 'admin') {
    window.removeEventListener('resize', handleResize)
    userChart?.dispose()
    courseChart?.dispose()
    revenueChart?.dispose()
    instrumentChart?.dispose()
  }
})
</script>
<template>
  <div v-if="role === 'admin'" class="admin-dashboard">
    <h1>首页</h1>

    <!-- 日期筛选 -->
    <el-card class="date-filter">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="handleDateChange"
      />
    </el-card>

    <!-- 核心指标 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="4" v-for="(value, key) in stats" :key="key">
        <el-card class="stat-card">
          <div class="card-content">
            <h3>{{ getStatLabel(key) }}</h3>
            <p>{{ value }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域：每行 4 个 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="6">
        <el-card>
          <div id="revenue-chart" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div id="instrument-chart" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div id="user-chart" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div id="course-chart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-card class="quick-actions">
      <template #header>
        <div class="card-header">
          <span>快捷操作</span>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-button type="primary" link>用户管理</el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" link>课程管理</el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" link>乐器管理</el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" link>财务报表</el-button>
        </el-col>
      </el-row>
    </el-card>
  </div>

  <!-- 教师/学生视图 -->
  <div v-else-if="role === 'teacher'" class="teacher-dashboard">
    <h1>教师工作台</h1>
    <el-card>
      <p>这里是教师专属内容</p>
    </el-card>
  </div>
  <div v-else-if="role === 'student'" class="student-dashboard">
    <h1>学生学习中心</h1>
    <el-card>
      <p>这里是学生专属内容</p>
    </el-card>
  </div>
</template>



<style lang="scss" scoped>
.admin-dashboard {
  h1 {
    margin-bottom: 20px;
    color: #333;
  }

  .date-filter {
    margin-bottom: 20px;
  }

  .stats-row {
    margin-bottom: 20px;

    .stat-card {
      text-align: center;

      .card-content {
        h3 {
          margin: 0 0 8px;
          color: #666;
          font-size: 14px;
        }

        p {
          margin: 0;
          font-size: 20px;
          color: #1890ff;
          font-weight: bold;
        }
      }
    }
  }

  .charts-row {
    margin-bottom: 20px;
  }

  .quick-actions {
    :deep(.el-card__header) {
      padding: 14px 20px;
      background-color: #f8f8f8;
      border-bottom: 1px solid #eee;
    }

    .card-header {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
  }
}
</style>