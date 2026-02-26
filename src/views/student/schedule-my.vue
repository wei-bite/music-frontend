<template>
  <div class="schedule-container">
    <el-card shadow="never" style="border-radius: 8px; border: 1px solid #e4e7ed;">
      <template #header>
        <div class="card-header">
          <span>我的课表</span>
        </div>
      </template>

      <!-- 筛选 -->
      <div class="filter-bar">
        <el-radio-group v-model="filterType" @change="handleFilterChange">
          <el-radio-button value="all">全部课程</el-radio-button>
          <el-radio-button value="upcoming">即将开始</el-radio-button>
          <el-radio-button value="completed">已完成</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 课表列表 -->
      <el-table :data="filteredList" style="width: 100%" v-loading="loading" border>
        <el-table-column prop="courseName" label="课程名称" min-width="150" align="center" />
        <el-table-column prop="teacherName" label="教师" min-width="100" align="center" />
        <el-table-column prop="roomName" label="琴房" min-width="100" align="center" />
        <el-table-column label="上课时间" min-width="180" align="center">
          <template #default="{ row }">
            {{ formatDateTime(row.startTime) }} ~ {{ formatTime(row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && filteredList.length === 0" description="暂无课程记录" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getStudentCourseListService, getStudentUpcomingCourseListService } from '@/api/student/student'

const loading = ref(false)
const courseList = ref([])
const filterType = ref('all')

const filteredList = computed(() => {
  if (filterType.value === 'all') return courseList.value
  if (filterType.value === 'upcoming') {
    return courseList.value.filter(item => item.status === 'scheduled')
  }
  if (filterType.value === 'completed') {
    return courseList.value.filter(item => item.status === 'completed')
  }
  return courseList.value
})

const loadCourseList = async () => {
  loading.value = true
  try {
    let res
    if (filterType.value === 'upcoming') {
      res = await getStudentUpcomingCourseListService()
    } else {
      res = await getStudentCourseListService()
    }
    if (res.code === 200) {
      courseList.value = Array.isArray(res.data) ? res.data : (res.data?.records || [])
    } else {
      ElMessage.error(res.message || '加载失败')
    }
  } catch (err) {
    ElMessage.error('网络错误，请重试')
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  loadCourseList()
}

const getStatusText = (status) => {
  const map = { scheduled: '待上课', completed: '已完成', cancelled: '已取消' }
  return map[status] || status
}

const getStatusTag = (status) => {
  const map = { scheduled: 'primary', completed: 'success', cancelled: 'info' }
  return map[status] || 'info'
}

const formatDateTime = (str) => {
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

const formatTime = (str) => {
  if (!str) return ''
  const date = new Date(str)
  if (isNaN(date.getTime())) return str
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

onMounted(() => {
  loadCourseList()
})
</script>

<style scoped lang="scss">
.schedule-container {
  padding: 20px;
  background-color: #f5f7fa;

  .card-header {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }

  .filter-bar {
    margin-bottom: 20px;
  }

  .el-table {
    :deep(.el-table__cell) {
      padding: 12px 16px;
    }

    :deep(.el-table__header-wrapper th) {
      background-color: #f9f9f9;
      font-weight: 500;
      color: #666;
    }
  }
}
</style>