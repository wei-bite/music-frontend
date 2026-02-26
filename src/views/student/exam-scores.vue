<template>
  <div class="exam-container">
    <el-card shadow="never" style="border-radius: 8px; border: 1px solid #e4e7ed;">
      <template #header>
        <div class="card-header">
          <span>我的考试成绩</span>
        </div>
      </template>

      <!-- 统计 -->
      <div class="stats-row">
        <el-card class="stat-card">
          <div class="stat-value">{{ examList.length }}</div>
          <div class="stat-label">考试次数</div>
        </el-card>
        <el-card class="stat-card">
          <div class="stat-value">{{ averageScore.toFixed(1) }}</div>
          <div class="stat-label">平均分</div>
        </el-card>
        <el-card class="stat-card">
          <div class="stat-value">{{ highestScore }}</div>
          <div class="stat-label">最高分</div>
        </el-card>
      </div>

      <!-- 成绩列表 -->
      <el-table :data="examList" style="width: 100%" v-loading="loading" border>
        <el-table-column prop="teacherName" label="任课教师" min-width="120" align="center" />
        <el-table-column prop="examName" label="考试名称" min-width="150" align="center" />
        <el-table-column prop="score" label="分数" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getScoreTag(row.score)" size="small">{{ row.score }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="comment" label="教师评语" min-width="200" align="center" show-overflow-tooltip />
        <el-table-column prop="examDate" label="考试日期" min-width="120" align="center" />
      </el-table>

      <el-empty v-if="!loading && examList.length === 0" description="暂无考试记录" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getMyExamScoresService } from '@/api/student/student'

const loading = ref(false)
const examList = ref([])

const averageScore = computed(() => {
  if (examList.value.length === 0) return 0
  const sum = examList.value.reduce((acc, item) => acc + (item.score || 0), 0)
  return sum / examList.value.length
})

const highestScore = computed(() => {
  if (examList.value.length === 0) return 0
  return Math.max(...examList.value.map(item => item.score || 0))
})

const loadExamList = async () => {
  loading.value = true
  try {
    const res = await getMyExamScoresService()
    if (res.code === 200) {
      examList.value = Array.isArray(res.data) ? res.data : (res.data?.records || [])
    } else {
      ElMessage.error(res.message || '加载失败')
    }
  } catch (err) {
    ElMessage.error('网络错误，请重试')
  } finally {
    loading.value = false
  }
}

const getScoreTag = (score) => {
  if (score >= 90) return 'success'
  if (score >= 60) return 'warning'
  return 'danger'
}

onMounted(() => {
  loadExamList()
})
</script>

<style scoped lang="scss">
.exam-container {
  padding: 20px;
  background-color: #f5f7fa;

  .card-header {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }

  .stats-row {
    display: flex;
    gap: 20px;
    margin-bottom: 24px;

    .stat-card {
      flex: 1;
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
    }
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
