<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCourseDetailService } from '@/api/admin/admin'
import { formatTime } from '@/utils/format'

const route = useRoute()
const course = ref(null)
const loading = ref(false)

// 根据 route.query.id 获取课程详情
const loadCourseDetail = async (id) => {
  if (!id) {
    ElMessage.warning('缺少课程ID')
    return
  }
  loading.value = true
  try {
    const res = await getCourseDetailService(id) // 假设接口返回 { data: Course }
    course.value = res.data
  } catch (err) {
    ElMessage.error('加载课程详情失败')
    course.value = null
  } finally {
    loading.value = false
  }
}

// 监听路由变化（支持浏览器前进/后退）
watch(
  () => route.query.id,
  (newId) => {
    if (newId) {
      loadCourseDetail(newId)
    } else {
      course.value = null
    }
  },
  { immediate: true }
)
</script>


<template>
  <div class="course-detail">
    <el-card>
      <template #header>
        <div class="detail-header">
          <span>课程详情</span>
          <el-button @click="$router.back()">返回</el-button>
        </div>
      </template>

      <el-descriptions :column="1" border v-if="course">
        <el-descriptions-item label="课程ID">{{ course.id }}</el-descriptions-item>
        <el-descriptions-item label="课程名称">{{ course.courseName }}</el-descriptions-item>
        <el-descriptions-item label="教师">{{ course.teacherName || '—' }}</el-descriptions-item>
        <el-descriptions-item label="课时时长">{{ course.duration }} 分钟</el-descriptions-item>
        <el-descriptions-item label="价格">¥{{ Number(course.price).toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatTime(course.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatTime(course.updatedAt) }}</el-descriptions-item>
        <el-descriptions-item label="简介">
          <div style="white-space: pre-wrap">{{ course.description || '无' }}</div>
        </el-descriptions-item>
      </el-descriptions>

      <el-empty v-else description="课程不存在或加载中..." />
    </el-card>
  </div>
</template>


<style scoped>
.course-detail {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>