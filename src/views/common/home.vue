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
            <p>{{ formatNumber(value) }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <!-- 收支概览 -->
      <el-col :span="6">
        <el-card>
          <div id="revenue-chart" style="height: 300px;"></div>
        </el-card>
      </el-col>

      <!-- 乐器状态 -->
      <el-col :span="6">
        <el-card>
          <div id="instrument-chart" style="height: 300px;"></div>
        </el-card>
      </el-col>

      <!-- 经营趋势（动态） -->
      <el-col :span="12">
        <el-card>
          <div id="trend-chart" style="height: 300px;"></div>
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
          <router-link to="/user1/list" class="dashboard-link">
            <el-button type="primary" link>用户管理</el-button>
          </router-link>
        </el-col>
        <el-col :span="6">
          <router-link to="/course/list" class="dashboard-link">
            <el-button type="primary" link>课程管理</el-button>
          </router-link>
        </el-col>
        <el-col :span="6">
          <router-link to="/music/room" class="dashboard-link">
            <el-button type="primary" link>乐器管理</el-button>
          </router-link>
        </el-col>
        <el-col :span="6">
          <router-link to="/operation/income" class="dashboard-link">
            <el-button type="primary" link>财务报表</el-button>
          </router-link>
        </el-col>
      </el-row>
    </el-card>
  </div>

  <!-- 教师工作台 -->
  <div v-else-if="role === 'teacher'" class="teacher-dashboard">
    <h1>教师工作台</h1>

    <!-- 核心指标 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-value">{{ teacherStats.todayLessonCount }}</div>
          <div class="stat-label">今日课量</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-value">{{ teacherStats.monthLessonCount }}</div>
          <div class="stat-label">本月已上课</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-value">{{ teacherStats.totalStudentCount }}</div>
          <div class="stat-label">累计学生</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card warning">
          <div class="stat-value">{{ teacherStats.pendingLeaveCount }}</div>
          <div class="stat-label">待审批请假</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card warning">
          <div class="stat-value">{{ teacherStats.pendingGradeCount }}</div>
          <div class="stat-label">待录入成绩</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <!-- 即将开始的课 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>即将开始的课</span>
              <router-link to="/teacher/schedule">
                <el-button type="primary" link>查看全部</el-button>
              </router-link>
            </div>
          </template>
          <el-table :data="teacherStats.upcomingLessons" style="width: 100%">
            <el-table-column prop="courseName" label="课程" />
            <el-table-column prop="studentName" label="学生" />
            <el-table-column prop="startTime" label="时间">
              <template #default="{ row }">
                {{ formatTime(row.startTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="roomName" label="琴房" />
          </el-table>
          <el-empty v-if="!teacherStats.upcomingLessons?.length" description="暂无即将开始的课" />
        </el-card>
      </el-col>

      <!-- 最近录入的成绩 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近录入的成绩</span>
              <router-link to="/teacher/score">
                <el-button type="primary" link>录入成绩</el-button>
              </router-link>
            </div>
          </template>
          <el-table :data="teacherStats.recentExams" style="width: 100%">
            <el-table-column prop="studentName" label="学生" />
            <el-table-column prop="examName" label="考试" />
            <el-table-column prop="score" label="分数">
              <template #default="{ row }">
                <el-tag :type="row.score >= 60 ? 'success' : 'danger'" size="small">{{ row.score }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="examDate" label="日期" />
          </el-table>
          <el-empty v-if="!teacherStats.recentExams?.length" description="暂无成绩记录" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-card class="quick-actions">
      <template #header>
        <div class="card-header"><span>快捷操作</span></div>
      </template>
      <el-row :gutter="20">
        <el-col :span="4"><router-link to="/teacher/schedule"><el-button type="primary">我的课表</el-button></router-link></el-col>
        <el-col :span="4"><router-link to="/teacher/attendance"><el-button type="primary">考勤管理</el-button></router-link></el-col>
        <el-col :span="4"><router-link to="/teacher/leave"><el-button type="warning">请假审批</el-button></router-link></el-col>
        <el-col :span="4"><router-link to="/teacher/score"><el-button type="success">考试打分</el-button></router-link></el-col>
        <el-col :span="4"><router-link to="/teacher/salary"><el-button>工资明细</el-button></router-link></el-col>
        <el-col :span="4"><router-link to="/teacher/reserve"><el-button>琴房预约</el-button></router-link></el-col>
      </el-row>
    </el-card>
  </div>

  <!-- 学生学习中心 -->
  <div v-else-if="role === 'student'" class="student-dashboard">
    <h1>学习中心</h1>

    <!-- 核心指标 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-value">{{ studentStats.totalLessons }}</div>
          <div class="stat-label">总课时</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-value">{{ studentStats.completedLessons }}</div>
          <div class="stat-label">已完成</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-value">{{ studentStats.upcomingLessons }}</div>
          <div class="stat-label">待上课</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-value">{{ studentStats.avgScore?.toFixed(1) || '-' }}</div>
          <div class="stat-label">平均分</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-value">{{ studentStats.attendanceRate }}%</div>
          <div class="stat-label">出勤率</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card warning">
          <div class="stat-value">{{ studentStats.pendingLeaves }}</div>
          <div class="stat-label">待审批请假</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="stats-row" style="margin-top: 20px;">
      <el-col :span="4">
        <el-card class="stat-card info">
          <div class="stat-value">{{ studentStats.activeReservations }}</div>
          <div class="stat-label">琴房预约</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card success">
          <div class="stat-value">{{ studentStats.activeRentals }}</div>
          <div class="stat-label">乐器租借</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <!-- 近期课程 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>近期课程</span>
              <router-link to="/student/schedule">
                <el-button type="primary" link>查看全部</el-button>
              </router-link>
            </div>
          </template>
          <el-table :data="studentStats.recentLessons" style="width: 100%">
            <el-table-column prop="courseName" label="课程" />
            <el-table-column prop="teacherName" label="教师" />
            <el-table-column prop="startTime" label="时间">
              <template #default="{ row }">
                {{ formatTime(row.startTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="row.status === 'completed' ? 'success' : 'primary'" size="small">
                  {{ row.status === 'completed' ? '已完成' : '待上课' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="!studentStats.recentLessons?.length" description="暂无课程记录" />
        </el-card>
      </el-col>

      <!-- 最近成绩 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近成绩</span>
              <router-link to="/student/exam">
                <el-button type="primary" link>查看全部</el-button>
              </router-link>
            </div>
          </template>
          <el-table :data="studentStats.recentExams" style="width: 100%">
            <el-table-column prop="examName" label="考试" />
            <el-table-column prop="score" label="分数">
              <template #default="{ row }">
                <el-tag :type="row.score >= 60 ? 'success' : 'danger'" size="small">{{ row.score }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="examDate" label="日期" />
            <el-table-column prop="comment" label="评语" show-overflow-tooltip />
          </el-table>
          <el-empty v-if="!studentStats.recentExams?.length" description="暂无成绩记录" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-card class="quick-actions">
      <template #header>
        <div class="card-header"><span>快捷操作</span></div>
      </template>
      <el-row :gutter="20">
        <el-col :span="4"><router-link to="/student/schedule"><el-button type="primary">我的课表</el-button></router-link></el-col>
        <el-col :span="4"><router-link to="/student/leave"><el-button type="warning">请假申请</el-button></router-link></el-col>
        <el-col :span="4"><router-link to="/student/exam"><el-button type="success">考试成绩</el-button></router-link></el-col>
        <el-col :span="4"><router-link to="/student/evaluate"><el-button>评价教师</el-button></router-link></el-col>
        <el-col :span="4"><router-link to="/student/reserve"><el-button>琴房预约</el-button></router-link></el-col>
        <el-col :span="4"><router-link to="/student/announcement"><el-button>公告活动</el-button></router-link></el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { useUserStore } from '@/stores'
import { getAdminDashboardService, getAdminEconomicTrendService } from '@/api/admin/admin'
import { getTeacherDashboardService } from '@/api/teacher/teacher'
import { getStudentDashboardService } from '@/api/student/student'

const userStore = useUserStore()
const role = userStore.role

// 响应式数据
const dateRange = ref([])
const stats = ref({
  totalUsers: 0,
  totalCourses: 0,
  totalInstruments: 0,
  pendingApprovals: 0,
  totalRevenue: 0,
  totalExpenses: 0
})

// 教师工作台数据
const teacherStats = ref({
  todayLessonCount: 0,
  monthLessonCount: 0,
  totalStudentCount: 0,
  pendingLeaveCount: 0,
  pendingGradeCount: 0,
  upcomingLessons: [],
  recentExams: []
})

// 学生学习中心数据
const studentStats = ref({
  totalLessons: 0,
  completedLessons: 0,
  upcomingLessons: 0,
  avgScore: 0,
  attendanceRate: 0,
  pendingLeaves: 0,
  activeReservations: 0,
  activeRentals: 0,
  recentLessons: [],
  recentExams: []
})

// 图表实例
let revenueChart = null
let instrumentChart = null
let trendChart = null

// 工具函数
const getStatLabel = (key) => {
  const labels = {
    totalUsers: '用户总数',
    totalCourses: '课程总数',
    totalInstruments: '乐器总数',
    pendingApprovals: '待审批事项',
    totalRevenue: '总收入',
    totalExpenses: '总支出'
  }
  return labels[key] || '未知指标'
}

const formatNumber = (num) => {
  if (typeof num === 'number' && !Number.isInteger(num)) {
    return num.toFixed(2)
  }
  return num
}

// 获取经济趋势并初始化折线图
const fetchAndInitTrendChart = async (startDate, endDate) => {
  try {
    const res = await getAdminEconomicTrendService({ startDate, endDate })
    if (res.code === 200) {
      console.log(res.data);
      initTrendChart(res.data)
    }
  } catch (error) {
    console.error('获取经济趋势数据失败:', error)
  }
}

// 初始化趋势折线图
const initTrendChart = (data) => {
  const dom = document.getElementById('trend-chart')
  if (!dom) return

  trendChart?.dispose()
  trendChart = echarts.init(dom)

  trendChart.setOption({
    title: { text: '经营趋势', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    legend: { data: ['收入', '支出'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.dates || []
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '收入',
        type: 'line',
        smooth: true,
        data: data.incomeTrend || [],
        lineStyle: { color: '#5470C6' }
      },
      {
        name: '支出',
        type: 'line',
        smooth: true,
        data: data.expenseTrend || [],
        lineStyle: { color: '#EE6666' }
      }
    ]
  })
}

// 日期变更处理
const handleDateChange = (val) => {
  if (val && val.length === 2) {
    const [start, end] = val
    fetchAndInitTrendChart(start, end)
  } else {
    // 如果清空了日期，可选：重置为默认7天或隐藏图表
    initTrendChart({
      dates: [],
      incomeTrend: [],
      expenseTrend: []
    })
  }
}

// 获取仪表盘基础数据
const fetchDashboardData = async () => {
  try {
    const res = await getAdminDashboardService()
    const data = res.data

    stats.value = {
      totalUsers: data.userStats?.totalUsers || 0,
      totalCourses: data.lessonStats?.totalCourses || 0,
      totalInstruments: data.resourceStatus?.totalInstruments || 0,
      pendingApprovals: data.pendingTasks?.totalPending || 0,
      totalRevenue: data.revenueStats?.totalRevenue || 0,
      totalExpenses: data.revenueStats?.totalExpense || 0
    }

    initBaseCharts(data)
    
    // 默认加载最近7天趋势（可选）
    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(today.getDate() - 6)
    dateRange.value = [sevenDaysAgo.toISOString().split('T')[0], today.toISOString().split('T')[0]]
    fetchAndInitTrendChart(dateRange.value[0], dateRange.value[1])
  } catch (error) {
    console.error('获取管理员仪表盘数据失败:', error)
  }
}

// 初始化基础图表（非趋势图）
const initBaseCharts = (data) => {
  // 收支柱状图
  const revDom = document.getElementById('revenue-chart')
  if (revDom) {
    revenueChart?.dispose()
    revenueChart = echarts.init(revDom)
    revenueChart.setOption({
      title: { text: '收支概览', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: {},
      xAxis: { type: 'category', data: ['收入', '支出'] },
      yAxis: { type: 'value' },
      series: [{
        type: 'bar',
        data: [
          { value: stats.value.totalRevenue, itemStyle: { color: '#5470C6' } },
          { value: stats.value.totalExpenses, itemStyle: { color: '#EE6666' } }
        ],
        label: { show: true, position: 'top' }
      }]
    })
  }

  // 乐器状态饼图
  const instDom = document.getElementById('instrument-chart')
  if (instDom) {
    instrumentChart?.dispose()
    instrumentChart = echarts.init(instDom)
    instrumentChart.setOption({
      title: { text: '乐器状态', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 1
        },
        label: { show: true, formatter: '{b}: {c}' },
        emphasis: { label: { show: true, fontSize: 14 } },
        data: data.instrumentStatusPie || []
      }]
    })
  }
}

// 窗口大小变化重绘
const handleResize = () => {
  revenueChart?.resize()
  instrumentChart?.resize()
  trendChart?.resize()
}

// 时间格式化
const formatTime = (str) => {
  if (!str) return ''
  const date = new Date(str)
  if (isNaN(date.getTime())) return str
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(/\//g, '-')
}

// 获取教师工作台数据
const fetchTeacherDashboard = async () => {
  try {
    const res = await getTeacherDashboardService()
    if (res.code === 200) {
      const data = res.data
      teacherStats.value = {
        todayLessonCount: data.todayLessonCount || 0,
        monthLessonCount: data.monthLessonCount || 0,
        totalStudentCount: data.totalStudentCount || 0,
        pendingLeaveCount: data.pendingLeaveCount || 0,
        pendingGradeCount: data.pendingGradeCount || 0,
        upcomingLessons: data.upcomingLessons || [],
        recentExams: data.recentExams || []
      }
    }
  } catch (error) {
    console.error('获取教师工作台数据失败:', error)
  }
}

// 获取学生学习中心数据
const fetchStudentDashboard = async () => {
  try {
    const res = await getStudentDashboardService()
    if (res.code === 200) {
      const data = res.data
      studentStats.value = {
        totalLessons: data.totalLessons || 0,
        completedLessons: data.completedLessons || 0,
        upcomingLessons: Array.isArray(data.upcomingLessons) ? data.upcomingLessons.length : (data.upcomingLessons || 0),
        avgScore: data.averageScore || data.avgScore || 0,
        attendanceRate: data.attendanceRate || 0,
        pendingLeaves: data.pendingLeaves || 0,
        activeReservations: data.activeReservations || 0,
        activeRentals: data.activeRentals || 0,
        recentLessons: Array.isArray(data.upcomingLessons) ? data.upcomingLessons : [],
        recentExams: data.recentExams || []
      }
    }
  } catch (error) {
    console.error('获取学生学习中心数据失败:', error)
  }
}

// 生命周期
onMounted(() => {
  if (role === 'admin') {
    fetchDashboardData()
    window.addEventListener('resize', handleResize)
  } else if (role === 'teacher') {
    fetchTeacherDashboard()
  } else if (role === 'student') {
    fetchStudentDashboard()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  revenueChart?.dispose()
  instrumentChart?.dispose()
  trendChart?.dispose()
})
</script>

<style lang="scss" scoped>
.admin-dashboard,
.teacher-dashboard,
.student-dashboard {
  h1 {
    margin-bottom: 20px;
    color: #333;
    font-size: 24px;
  }

  .stats-row {
    margin-bottom: 20px;

    .stat-card {
      text-align: center;
      padding: 16px;

      .stat-value {
        font-size: 28px;
        font-weight: 600;
        color: #409eff;
      }

      .stat-label {
        margin-top: 8px;
        font-size: 14px;
        color: #909399;
      }

      &.warning .stat-value {
        color: #e6a23c;
      }
      
      &.info .stat-value {
        color: #909399;
      }
      
      &.success .stat-value {
        color: #67c23a;
      }
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }

  .quick-actions {
    margin-top: 20px;

    :deep(.el-card__header) {
      padding: 14px 20px;
      background-color: #f8f8f8;
      border-bottom: 1px solid #eee;
    }

    .el-button {
      width: 100%;
    }

    a {
      text-decoration: none;
      display: block;
    }
  }
}

.admin-dashboard {
  .date-filter {
    margin-bottom: 20px;
    text-align: center;
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

    .dashboard-link {
      text-decoration: none;
      display: block;
      width: 100%;
    }

    :deep(.el-button) {
      width: 100%;
    }
  }
}
</style>