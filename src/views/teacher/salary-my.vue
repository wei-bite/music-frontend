<template>
  <div class="salary-container">
    <el-card shadow="never" style="border-radius: 8px; border: 1px solid #e4e7ed;">
      <template #header>
        <div class="card-header">
          <span>我的工资明细</span>
        </div>
      </template>

      <!-- 统计卡片 -->
      <div class="stats-row">
        <el-card class="stat-card">
          <div class="stat-value">¥{{ totalEarned.toFixed(2) }}</div>
          <div class="stat-label">累计已发放</div>
        </el-card>
        <el-card class="stat-card">
          <div class="stat-value">¥{{ totalPending.toFixed(2) }}</div>
          <div class="stat-label">待发放</div>
        </el-card>
        <el-card class="stat-card">
          <div class="stat-value">{{ salaryList.length }}</div>
          <div class="stat-label">记录数</div>
        </el-card>
      </div>

      <!-- 表格 -->
      <el-table :data="salaryList" style="width: 100%" v-loading="loading" border>
        <el-table-column prop="month" label="工资月份" min-width="100" align="center" />
        <el-table-column prop="baseSalary" label="基本工资" min-width="100" align="center">
          <template #default="{ row }">¥{{ row.baseSalary }}</template>
        </el-table-column>
        <el-table-column prop="lessonBonus" label="课时奖金" min-width="100" align="center">
          <template #default="{ row }">¥{{ row.lessonBonus }}</template>
        </el-table-column>
        <el-table-column prop="deductions" label="扣款" min-width="100" align="center">
          <template #default="{ row }">¥{{ row.deductions }}</template>
        </el-table-column>
        <el-table-column prop="totalSalary" label="实发工资" min-width="120" align="center">
          <template #default="{ row }">
            <strong style="color: #409eff;">¥{{ row.totalSalary }}</strong>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'paid' ? 'success' : 'warning'" size="small">
              {{ row.status === 'paid' ? '已发放' : '待发放' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="payDate" label="发放时间" min-width="160" align="center">
          <template #default="{ row }">
            {{ row.payDate ? formatDateTime(row.payDate) : '-' }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getSalaryService } from '@/api/teacher/teacher'

const loading = ref(false)
const salaryList = ref([])

// 统计计算
const totalEarned = computed(() => {
  return salaryList.value
    .filter(item => item.status === 'paid')
    .reduce((sum, item) => sum + (item.totalSalary || 0), 0)
})

const totalPending = computed(() => {
  return salaryList.value
    .filter(item => item.status === 'pending')
    .reduce((sum, item) => sum + (item.totalSalary || 0), 0)
})

const loadSalaryList = async () => {
  loading.value = true
  try {
    const res = await getSalaryService()
    if (res.code === 200) {
      salaryList.value = Array.isArray(res.data) ? res.data : []
    } else {
      ElMessage.error(res.message || '加载失败')
    }
  } catch (err) {
    ElMessage.error('网络错误，请重试')
    console.error(err)
  } finally {
    loading.value = false
  }
}

const formatDateTime = (str) => {
  if (!str) return ''
  const date = new Date(str)
  if (isNaN(date.getTime())) return str
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(/\//g, '-')
}

onMounted(() => {
  loadSalaryList()
})
</script>

<style scoped lang="scss">
.salary-container {
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