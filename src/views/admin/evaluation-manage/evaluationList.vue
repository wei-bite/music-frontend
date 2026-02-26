<template>
  <div class="evaluation-container">
    <!-- 统计概览卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ overviewData.totalTeachers }}</div>
            <div class="stat-label">教师总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ overviewData.totalEvaluations }}</div>
            <div class="stat-label">总评价数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ overviewData.overallAverageScore?.toFixed(2) || '0.00' }}</div>
            <div class="stat-label">整体平均分</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ overviewData.excellentTeachers }}</div>
            <div class="stat-label">优秀教师数</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 教师评价列表 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>教师评价统计</span>
        </div>
      </template>
      
      <el-table 
        :data="teacherList" 
        v-loading="loading"
        style="width: 100%"
        :default-sort="{ prop: 'averageScore', order: 'descending' }"
      >
        <el-table-column prop="rank" label="排名" width="80" sortable align="center" />
        <el-table-column prop="teacherName" label="教师姓名" width="160">
          <template #default="{ row }">
            <div class="teacher-cell">
              <el-avatar 
                :size="40" 
                :src="row.teacherAvatar" 
                icon="User"
                style="margin-right: 12px"
              />
              <span>{{ row.teacherName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="instrument" label="教授乐器" width="140" />
        <el-table-column prop="level" label="教师级别" width="120" />
        <el-table-column prop="totalEvaluations" label="评价总数" width="130" sortable align="center" />
        <el-table-column prop="averageScore" label="平均分" width="130" sortable align="center">
          <template #default="{ row }">
            <el-tag :type="getScoreTagType(row.averageScore)" size="small">
              {{ row.averageScore?.toFixed(2) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="星级分布" min-width="220">
          <template #default="{ row }">
            <div class="star-distribution">
              <span class="star-item">
                <el-tag type="danger" size="small">★{{ row.oneStarCount || 0 }}</el-tag>
              </span>
              <span class="star-item">
                <el-tag type="warning" size="small">★★{{ row.twoStarCount || 0 }}</el-tag>
              </span>
              <span class="star-item">
                <el-tag type="info" size="small">★★★{{ row.threeStarCount || 0 }}</el-tag>
              </span>
              <span class="star-item">
                <el-tag type="primary" size="small">★★★★{{ row.fourStarCount || 0 }}</el-tag>
              </span>
              <span class="star-item">
                <el-tag type="success" size="small">★★★★★{{ row.fiveStarCount || 0 }}</el-tag>
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="rankLevel" label="等级" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getRankLevelTagType(row.rankLevel)" size="small">
              {{ row.rankLevel }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleViewDetail(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="教师评价详情"
      width="600px"
    >
      <div v-if="selectedTeacher" class="teacher-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="教师姓名">{{ selectedTeacher.teacherName }}</el-descriptions-item>
          <el-descriptions-item label="教授乐器">{{ selectedTeacher.instrument }}</el-descriptions-item>
          <el-descriptions-item label="教师级别">{{ selectedTeacher.level }}</el-descriptions-item>
          <el-descriptions-item label="综合排名">{{ selectedTeacher.rank }}</el-descriptions-item>
          <el-descriptions-item label="评价总数">{{ selectedTeacher.totalEvaluations }}</el-descriptions-item>
          <el-descriptions-item label="平均分">
            <el-tag :type="getScoreTagType(selectedTeacher.averageScore)" size="small">
              {{ selectedTeacher.averageScore?.toFixed(2) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="等级">
            <el-tag :type="getRankLevelTagType(selectedTeacher.rankLevel)" size="small">
              {{ selectedTeacher.rankLevel }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
        
        <div class="star-distribution-detail">
          <h4>星级分布详情</h4>
          <el-progress 
            :percentage="(selectedTeacher.oneStarCount / selectedTeacher.totalEvaluations * 100)" 
            status="exception"
            :format="() => `1星: ${selectedTeacher.oneStarCount || 0}`"
          />
          <el-progress 
            :percentage="(selectedTeacher.twoStarCount / selectedTeacher.totalEvaluations * 100)" 
            status="warning"
            :format="() => `2星: ${selectedTeacher.twoStarCount || 0}`"
          />
          <el-progress 
            :percentage="(selectedTeacher.threeStarCount / selectedTeacher.totalEvaluations * 100)" 
            status="info"
            :format="() => `3星: ${selectedTeacher.threeStarCount || 0}`"
          />
          <el-progress 
            :percentage="(selectedTeacher.fourStarCount / selectedTeacher.totalEvaluations * 100)" 
            status="primary"
            :format="() => `4星: ${selectedTeacher.fourStarCount || 0}`"
          />
          <el-progress 
            :percentage="(selectedTeacher.fiveStarCount / selectedTeacher.totalEvaluations * 100)" 
            status="success"
            :format="() => `5星: ${selectedTeacher.fiveStarCount || 0}`"
          />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getEvaluationOverviewService,
  getTeacherEvaluationsService,
  getTeacherEvaluationDetailService
} from '@/api/admin/evaluation'

// 响应式数据
const loading = ref(false)
const overviewData = ref({
  totalTeachers: 0,
  totalEvaluations: 0,
  overallAverageScore: 0,
  excellentTeachers: 0,
  goodTeachers: 0,
  averageTeachers: 0,
  poorTeachers: 0
})

const teacherList = ref([])
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const detailDialogVisible = ref(false)
const selectedTeacher = ref(null)

// 获取评分标签类型
const getScoreTagType = (score) => {
  if (score >= 4.5) return 'success'
  if (score >= 3.5) return 'primary'
  if (score >= 2.5) return 'warning'
  return 'danger'
}

// 获取等级标签类型
const getRankLevelTagType = (level) => {
  switch (level) {
    case '优秀': return 'success'
    case '良好': return 'primary'
    case '一般': return 'warning'
    case '需改进': return 'danger'
    default: return 'info'
  }
}

// 获取统计概览
const fetchOverview = async () => {
  try {
    const res = await getEvaluationOverviewService()
    if (res.code === 200) {
      overviewData.value = res.data
      console.log('获取统计概览成功:', res.data)
    } else {
      ElMessage.error(res.message || '获取统计概览失败')
      console.error('获取统计概览失败:', res)
    }
  } catch (error) {
    ElMessage.error('获取统计概览失败')
    console.error('获取统计概览失败:', error)
  }
}

// 获取教师评价列表
const fetchTeacherEvaluations = async () => {
  loading.value = true
  try {
    const res = await getTeacherEvaluationsService({
      page: pagination.value.currentPage,
      size: pagination.value.pageSize
    })
    if (res.code === 200) {
      teacherList.value = res.data?.records || res.data || []
      pagination.value.total = res.data?.total || teacherList.value.length
      console.log('获取教师评价列表成功:', teacherList.value)
    } else {
      ElMessage.error(res.message || '获取教师评价列表失败')
      console.error('获取教师评价列表失败:', res)
    }
  } catch (error) {
    ElMessage.error('获取教师评价列表失败')
    console.error('获取教师评价列表失败:', error)
  } finally {
    loading.value = false
  }
}


// 分页处理
const handleSizeChange = (val) => {
  pagination.value.pageSize = val
  fetchTeacherEvaluations()
}

const handleCurrentChange = (val) => {
  pagination.value.currentPage = val
  fetchTeacherEvaluations()
}

// 查看详情
const handleViewDetail = async (row) => {
  try {
    const res = await getTeacherEvaluationDetailService(row.teacherId)
    if (res.code === 200) {
      selectedTeacher.value = res.data
      detailDialogVisible.value = true
    }
  } catch (error) {
    ElMessage.error('获取教师详情失败')
    console.error('获取教师详情失败:', error)
  }
}

// 生命周期
onMounted(() => {
  fetchOverview()
  fetchTeacherEvaluations()
})

// 模拟统计概览数据
const useMockOverviewData = () => {
  overviewData.value = {
    totalTeachers: 15,
    totalEvaluations: 245,
    overallAverageScore: 4.20,
    excellentTeachers: 8,
    goodTeachers: 5,
    averageTeachers: 2,
    poorTeachers: 0
  }
  console.log('使用模拟统计概览数据:', overviewData.value)
}

// 模拟教师评价数据
const useMockTeacherData = () => {
  const mockData = [
    {
      teacherId: 1,
      teacherName: "李老师",
      instrument: "钢琴",
      level: "高级",
      totalEvaluations: 45,
      averageScore: 4.67,
      oneStarCount: 1,
      twoStarCount: 2,
      threeStarCount: 5,
      fourStarCount: 15,
      fiveStarCount: 22,
      rank: 1,
      rankLevel: "优秀"
    },
    {
      teacherId: 2,
      teacherName: "王老师",
      instrument: "小提琴",
      level: "中级",
      totalEvaluations: 38,
      averageScore: 4.35,
      oneStarCount: 0,
      twoStarCount: 3,
      threeStarCount: 8,
      fourStarCount: 12,
      fiveStarCount: 15,
      rank: 2,
      rankLevel: "良好"
    },
    {
      teacherId: 3,
      teacherName: "张老师",
      instrument: "吉他",
      level: "高级",
      totalEvaluations: 32,
      averageScore: 4.12,
      oneStarCount: 2,
      twoStarCount: 1,
      threeStarCount: 6,
      fourStarCount: 10,
      fiveStarCount: 13,
      rank: 3,
      rankLevel: "良好"
    },
    {
      teacherId: 4,
      teacherName: "陈老师",
      instrument: "古筝",
      level: "中级",
      totalEvaluations: 28,
      averageScore: 3.85,
      oneStarCount: 1,
      twoStarCount: 4,
      threeStarCount: 9,
      fourStarCount: 8,
      fiveStarCount: 6,
      rank: 4,
      rankLevel: "一般"
    }
  ]
  
  // 应用搜索筛选
  let filteredData = [...mockData]
  
  // 分数筛选
  if (searchForm.value.minScore) {
    filteredData = filteredData.filter(item => item.averageScore >= searchForm.value.minScore)
  }
  if (searchForm.value.maxScore) {
    filteredData = filteredData.filter(item => item.averageScore <= searchForm.value.maxScore)
  }
  
  // 排序
  if (searchForm.value.sortBy === 'averageScore') {
    filteredData.sort((a, b) => {
      return searchForm.value.order === 'desc' ? b.averageScore - a.averageScore : a.averageScore - b.averageScore
    })
  } else if (searchForm.value.sortBy === 'totalEvaluations') {
    filteredData.sort((a, b) => {
      return searchForm.value.order === 'desc' ? b.totalEvaluations - a.totalEvaluations : a.totalEvaluations - b.totalEvaluations
    })
  }
  
  // 分页
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  teacherList.value = filteredData.slice(start, end)
  pagination.value.total = filteredData.length
  
  console.log('使用模拟教师数据:', teacherList.value)
}

</script>

<style scoped lang="scss">
.evaluation-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;

  .stats-row {
    margin-bottom: 25px;
    gap: 20px;

    .el-col {
      padding: 0 10px;
    }

    .stat-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      border: 1px solid #e4e7ed;
      transition: all 0.3s ease;
      background: white;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
      }

      .stat-content {
        text-align: center;
        padding: 25px 15px;

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #409eff;
          margin-bottom: 10px;
        }

        .stat-label {
          font-size: 14px;
          color: #606266;
          font-weight: 500;
        }
      }
    }
  }

  .card-header {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    padding: 20px;
    border-bottom: 1px solid #ebeef5;
  }

  .el-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid #e4e7ed;
    margin-bottom: 25px;
    background: white;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .el-table {
    border-radius: 6px;
    overflow: hidden;

    :deep(.el-table__header) {
      th {
        background-color: #f8f9fa;
        color: #303133;
        font-weight: 600;
        border-bottom: 2px solid #e4e7ed;
        padding: 15px 12px;
      }
    }

    :deep(.el-table__row) {
      &:hover {
        background-color: #f5f7fa;
      }

      td {
        border-bottom: 1px solid #ebeef5;
        padding: 15px 12px;
      }
    }
  }

  .teacher-cell {
    display: flex;
    align-items: center;
    gap: 12px;

    .el-avatar {
      border: 2px solid #e4e7ed;
    }

    span {
      font-weight: 500;
      color: #303133;
    }
  }

  .star-distribution {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-start;

    .star-item {
      .el-tag {
        border-radius: 16px;
        font-weight: 500;
      }
    }
  }

  .pagination-container {
    margin-top: 30px;
    display: flex;
    justify-content: center;
    padding: 20px;
    background: white;
    border-radius: 8px;
    border: 1px solid #e4e7ed;

    :deep(.el-pagination) {
      .btn-prev,
      .btn-next,
      .el-pager li {
        border-radius: 6px;
        margin: 0 4px;
        border: 1px solid #dcdfe6;
        background: white;

        &:hover {
          color: #409eff;
          border-color: #409eff;
        }

        &.is-active {
          background: #409eff;
          border-color: #409eff;
          color: white;
        }
      }
    }
  }

  .teacher-detail {
    .el-descriptions {
      background: #f8f9fa;
      border-radius: 6px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .star-distribution-detail {
      padding: 20px;
      background: #f8f9fa;
      border-radius: 6px;

      h4 {
        margin-bottom: 20px;
        color: #303133;
        font-size: 16px;
        font-weight: 600;
        text-align: center;
      }

      .el-progress {
        margin-bottom: 15px;
        border-radius: 8px;
        overflow: hidden;

        :deep(.el-progress-bar__outer) {
          border-radius: 8px;
          background-color: #e4e7ed;
        }

        :deep(.el-progress-bar__inner) {
          border-radius: 8px;
        }
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    padding: 15px;

    .stats-row {
      .el-col {
        margin-bottom: 15px;
        padding: 0 5px;
      }
    }

    .teacher-cell {
      flex-direction: column;
      text-align: center;
      gap: 8px;
    }

    .star-distribution {
      justify-content: center;
    }
  }
}
</style>