<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>课节详情</span>
        <el-button @click="router.back()">返回</el-button>
      </div>
    </template>

    <el-descriptions :column="2" border>
      <!-- 基本信息 -->
      <el-descriptions-item label="课节ID">{{ detail.id }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="getStatusType(detail.status)">{{ getStatusText(detail.status) }}</el-tag>
        <el-button v-if="detail.status === 'scheduled'" type="success" size="small" @click="handleComplete" :loading="submitting" style="margin-left: 10px;">
          标记完成
        </el-button>
      </el-descriptions-item>

      <!-- 课程信息 -->
      <el-descriptions-item label="课程名称">{{ detail.courseName }}</el-descriptions-item>
      <el-descriptions-item label="课程时长">{{ detail.courseDuration }} 分钟</el-descriptions-item>
      <el-descriptions-item label="课程价格">¥{{ detail.coursePrice }}</el-descriptions-item>

      <!-- 教师信息 -->
      <el-descriptions-item label="教师姓名">{{ detail.teacherName || '—' }}</el-descriptions-item>
      <el-descriptions-item label="教师资质">{{ detail.teacherQualification || '—' }}</el-descriptions-item>
      <el-descriptions-item label="教学经验">{{ detail.teacherExperience || '—' }}</el-descriptions-item>

      <!-- 学生信息 -->
      <el-descriptions-item label="学生姓名">{{ detail.studentName || '—' }}</el-descriptions-item>
      <el-descriptions-item label="学生等级">{{ detail.studentLevel || '—' }}</el-descriptions-item>
      <el-descriptions-item label="学习乐器">{{ detail.studentInstrument || '—' }}</el-descriptions-item>

      <!-- 琴房信息 -->
      <el-descriptions-item label="琴房名称">{{ detail.roomName || '—' }}</el-descriptions-item>
      <el-descriptions-item label="琴房位置">{{ detail.roomLocation || '—' }}</el-descriptions-item>
      <el-descriptions-item label="琴房设备">{{ detail.roomEquipment || '—' }}</el-descriptions-item>

      <!-- 时间信息 -->
      <el-descriptions-item label="开始时间">{{ formatDateTime(detail.startTime) }}</el-descriptions-item>
      <el-descriptions-item label="结束时间">{{ formatDateTime(detail.endTime) }}</el-descriptions-item>
    </el-descriptions>

    <div style="margin-top: 20px; text-align: right;">
      <el-button @click="router.back()">关闭</el-button>
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

import { getScheduleDetailService , completeScheduleService} from '@/api/admin/schedule'

const route = useRoute()
const router = useRouter()
const detail = ref({})

// 获取详情
const loadDetail = async () => {
  try {
    const res = await getScheduleDetailService(route.params.id)
    if (res.code === 200) {
      detail.value = res.data
    } else {
      ElMessage.error(res.message || '获取失败')
      router.back()
    }
  } catch (err) {
    ElMessage.error('网络错误，请重试')
    console.error(err)
    router.back()
  }
}

// 格式化时间
const formatDateTime = (isoStr) => {
  return isoStr ? dayjs(isoStr).format('YYYY-MM-DD HH:mm') : '—'
}

// 状态类型映射
const getStatusType = (status) => {
  switch (status) {
    case 'completed': return 'success'
    case 'scheduled': return 'info'
    case 'cancelled': return 'danger'
    default: return 'info'
  }
}

// 状态文本映射
const getStatusText = (status) => {
  switch (status) {
    case 'completed': return '已完成'
    case 'scheduled': return '已安排'
    case 'cancelled': return '已取消'
    default: return '未知'
  }
}

//标记按钮点击事件
const handleComplete = async () => {
  try {
    await ElMessageBox.confirm(
      '确认将此课程标记为“已完成”？系统将自动生成学费收入记录。',
      '提示',
      { type: 'warning' }
    )
    await completeScheduleService(detail.value.id)
    ElMessage.success('课程已成功标记为已完成！')
    // 刷新状态
    loadDetail()
  } catch (err) {
    if (err !== 'cancel') {
      const msg = err.response?.data?.message || '操作失败'
      ElMessage.error(msg)
    }
  }
}

// 初始化
onMounted(() => {
  if (!route.params.id) {
    ElMessage.warning('无效的课节ID')
    router.back()
    return
  }
  loadDetail()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>