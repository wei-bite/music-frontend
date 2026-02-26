<template>
  <div class="schedule-calendar">
    <el-calendar v-model="currentDate">
      <template #date-cell="{ data }">
        <div class="calendar-cell">
          <span class="day-text">{{ getDayOfMonth(data.day) }}</span>
          <div class="lessons-list">
            <template v-if="lessonsByDate[data.day]?.length > 0">
              <div
                v-for="lesson in lessonsByDate[data.day]"
                :key="lesson.id"
                class="lesson-item"
                :class="getStatusClass(lesson.status)"
              >
                {{ lesson.courseName }} ({{ formatTime(lesson.startTime) }})
              </div>
            </template>
          </div>
        </div>
      </template>
    </el-calendar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getTeacherCourseListService } from '@/api/teacher/teacher'

const currentDate = ref(new Date())
const schedule = ref([])

// 按日期分组（key 直接用 YYYY-MM-DD 字符串）
const lessonsByDate = computed(() => {
  const map = {}
  schedule.value.forEach((lesson) => {
    if (!lesson.startTime) return
    // 取 startTime 的日期部分 "2026-03-15T14:30:00" -> "2026-03-15"
    const dateKey = lesson.startTime.split('T')[0]
    if (!map[dateKey]) map[dateKey] = []
    map[dateKey].push(lesson)
  })
  console.log('lessonsByDate:', map)
  return map
})

onMounted(async () => {
  try {
    const res = await getTeacherCourseListService()
    if (res.code === 200) {
      schedule.value = Array.isArray(res.data) ? res.data : []
      console.log('课表加载成功:', res.data)
    }
  } catch (error) {
    console.error('加载失败:', error)
  }
})

const getDayOfMonth = (day) => {
  if (typeof day === 'string') {
    return parseInt(day.split('-')[2], 10)
  }
  return ''
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const match = timeStr.match(/T(\d{2}):(\d{2})/)
  return match ? `${match[1]}:${match[2]}` : ''
}

const getStatusClass = (status) => {
  return {
    scheduled: 'status-scheduled',
    ongoing: 'status-ongoing',
    completed: 'status-completed',
    cancelled: 'status-cancelled'
  }[status] || ''
}
</script>

<style lang="scss" scoped>
.schedule-calendar {
  padding: 20px;
  background-color: #f9fafb;

  :deep(.el-calendar-day) {
    height: 140px !important;
  }

  .calendar-cell {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 4px;
    box-sizing: border-box;
  }

  .day-text {
    font-weight: bold;
    margin-bottom: 4px;
    color: #333;
    font-size: 14px;
  }

  .lessons-list {
    width: 100%;
    max-height: 100px;
    overflow-y: auto;
    text-align: left;
    font-size: 12px;
  }

  .lesson-item {
    margin: 2px 0;
    padding: 2px 4px;
    border-radius: 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .no-lesson {
    color: #999;
    text-align: center;
    font-size: 12px;
  }

  // 状态样式定义
  .status-scheduled {
    background-color: #e6f7ff;
    color: #1890ff;
  }

  .status-ongoing {
    background-color: #fff7e6;
    color: #fa8c16;
  }

  .status-completed {
    background-color: #f6ffed;
    color: #52c41a;
  }

  .status-cancelled {
    background-color: #fff2f0;
    color: #ff4d4f;
    text-decoration: line-through;
  }
}
</style>