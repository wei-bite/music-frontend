<template>
  <div class="ranking-container">
    <!-- 排行榜展示 -->
    <el-row :gutter="20">
      <!-- 前三名展示 -->
      <el-col :span="24" v-if="topThree.length > 0">
        <div class="top-three-container">
          <h2 class="ranking-title">🏆 教师评分排行榜</h2>
          <el-row :gutter="30" justify="center">
            <!-- 第二名 -->
            <el-col :span="6">
              <div class="ranking-card second-place">
                <div class="medal">🥈</div>
                <div class="teacher-avatar">
                  <el-avatar :size="80" :src="topThree[1]?.teacherAvatar" icon="User" />
                </div>
                <div class="teacher-info">
                  <h3 class="teacher-name">{{ topThree[1]?.teacherName }}</h3>
                  <p class="teacher-instrument">{{ topThree[1]?.instrument }}</p>
                  <div class="score-display">
                    <span class="score">{{ topThree[1]?.averageScore?.toFixed(2) }}</span>
                    <span class="score-label">平均分</span>
                  </div>
                  <div class="evaluation-count">
                    {{ topThree[1]?.totalEvaluations }}条评价
                  </div>
                </div>
              </div>
            </el-col>

            <!-- 第一名 -->
            <el-col :span="6">
              <div class="ranking-card first-place">
                <div class="medal">🥇</div>
                <div class="teacher-avatar">
                  <el-avatar :size="100" :src="topThree[0]?.teacherAvatar" icon="User" />
                </div>
                <div class="teacher-info">
                  <h3 class="teacher-name">{{ topThree[0]?.teacherName }}</h3>
                  <p class="teacher-instrument">{{ topThree[0]?.instrument }}</p>
                  <div class="score-display">
                    <span class="score">{{ topThree[0]?.averageScore?.toFixed(2) }}</span>
                    <span class="score-label">平均分</span>
                  </div>
                  <div class="evaluation-count">
                    {{ topThree[0]?.totalEvaluations }}条评价
                  </div>
                </div>
              </div>
            </el-col>

            <!-- 第三名 -->
            <el-col :span="6">
              <div class="ranking-card third-place">
                <div class="medal">🥉</div>
                <div class="teacher-avatar">
                  <el-avatar :size="80" :src="topThree[2]?.teacherAvatar" icon="User" />
                </div>
                <div class="teacher-info">
                  <h3 class="teacher-name">{{ topThree[2]?.teacherName }}</h3>
                  <p class="teacher-instrument">{{ topThree[2]?.instrument }}</p>
                  <div class="score-display">
                    <span class="score">{{ topThree[2]?.averageScore?.toFixed(2) }}</span>
                    <span class="score-label">平均分</span>
                  </div>
                  <div class="evaluation-count">
                    {{ topThree[2]?.totalEvaluations }}条评价
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-col>

      <!-- 完整排行榜列表 -->
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>完整排行榜</span>
              <el-tag type="success">共{{ rankingList.length }}位教师</el-tag>
            </div>
          </template>
          
          <el-table 
            :data="rankingList" 
            v-loading="loading"
            style="width: 100%"
            row-key="teacherId"
          >
            <el-table-column prop="teacherName" label="教师姓名" width="180">
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
            <el-table-column prop="instrument" label="教授乐器" width="150" />
            <el-table-column prop="level" label="教师级别" width="120" />
            <el-table-column prop="averageScore" label="平均分" width="130" sortable align="center">
              <template #default="{ row }">
                <div class="score-cell">
                  <el-tag :type="getScoreTagType(row.averageScore)" size="large">
                    {{ row.averageScore?.toFixed(2) }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="totalEvaluations" label="评价数" width="120" sortable align="center" />
            <el-table-column label="星级分布" min-width="280">
              <template #default="{ row }">
                <div class="star-distribution">
                  <div class="star-bar">
                    <span class="star-label">5★</span>
                    <el-progress 
                      :percentage="(row.fiveStarCount / row.totalEvaluations * 100)" 
                      :stroke-width="8"
                      status="success"
                      :show-text="false"
                    />
                    <span class="star-count">{{ row.fiveStarCount || 0 }}</span>
                  </div>
                  <div class="star-bar">
                    <span class="star-label">4★</span>
                    <el-progress 
                      :percentage="(row.fourStarCount / row.totalEvaluations * 100)" 
                      :stroke-width="8"
                      status="primary"
                      :show-text="false"
                    />
                    <span class="star-count">{{ row.fourStarCount || 0 }}</span>
                  </div>
                  <div class="star-bar">
                    <span class="star-label">3★</span>
                    <el-progress 
                      :percentage="(row.threeStarCount / row.totalEvaluations * 100)" 
                      :stroke-width="8"
                      status="info"
                      :show-text="false"
                    />
                    <span class="star-count">{{ row.threeStarCount || 0 }}</span>
                  </div>
                  <div class="star-bar">
                    <span class="star-label">2★</span>
                    <el-progress 
                      :percentage="(row.twoStarCount / row.totalEvaluations * 100)" 
                      :stroke-width="8"
                      status="warning"
                      :show-text="false"
                    />
                    <span class="star-count">{{ row.twoStarCount || 0 }}</span>
                  </div>
                  <div class="star-bar">
                    <span class="star-label">1★</span>
                    <el-progress 
                      :percentage="(row.oneStarCount / row.totalEvaluations * 100)" 
                      :stroke-width="8"
                      status="exception"
                      :show-text="false"
                    />
                    <span class="star-count">{{ row.oneStarCount || 0 }}</span>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="rankLevel" label="等级" width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="getRankLevelTagType(row.rankLevel)" size="small">
                  {{ row.rankLevel }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getEvaluationRankingService } from '@/api/admin/evaluation'

// 响应式数据
const loading = ref(false)
const rankingList = ref([])

// 计算前三名
const topThree = computed(() => {
  return rankingList.value.slice(0, 3)
})

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

// 获取排行榜数据
const fetchRanking = async () => {
  loading.value = true
  try {
    const res = await getEvaluationRankingService({ topN: 10 })
    if (res.code === 200) {
      rankingList.value = res.data || []
      console.log('获取排行榜成功:', rankingList.value)
    } else {
      ElMessage.error(res.message || '获取排行榜失败')
      console.error('获取排行榜失败:', res)
    }
  } catch (error) {
    ElMessage.error('获取排行榜失败')
    console.error('获取排行榜失败:', error)
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  fetchRanking()
})
</script>

<style scoped lang="scss">
.ranking-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;

  .ranking-title {
    text-align: center;
    font-size: 28px;
    font-weight: 700;
    color: #303133;
    margin-bottom: 35px;
    position: relative;

    &::after {
      content: "";
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 3px;
      background-color: #409eff;
      border-radius: 2px;
    }
  }

  .top-three-container {
    margin-bottom: 40px;

    .ranking-card {
      text-align: center;
      padding: 25px 20px;
      border-radius: 12px;
      position: relative;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
      background: white;
      border: 1px solid #e4e7ed;
      margin: 0 10px;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
      }

      .medal {
        font-size: 36px;
        position: absolute;
        top: -18px;
        left: 50%;
        transform: translateX(-50%);
      }

      .teacher-avatar {
        margin: 20px 0;
        
        .el-avatar {
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      }

      .teacher-info {
        .teacher-name {
          font-size: 20px;
          font-weight: 600;
          margin: 12px 0 8px;
          color: #303133;
        }

        .teacher-instrument {
          color: #606266;
          margin-bottom: 15px;
          font-size: 14px;
        }

        .score-display {
          .score {
            font-size: 24px;
            font-weight: 700;
            color: #409eff;
            display: block;
            margin-bottom: 5px;
          }

          .score-label {
            font-size: 13px;
            color: #909399;
          }
        }

        .evaluation-count {
          margin-top: 12px;
          color: #909399;
          font-size: 13px;
          background: #f5f7fa;
          padding: 5px 10px;
          border-radius: 16px;
          display: inline-block;
        }
      }

      &.first-place {
        background: #fff9e6;
        border-color: #ffd700;
        transform: scale(1.05);

        .teacher-name,
        .teacher-instrument,
        .score-label,
        .evaluation-count {
          color: #b8860b;
        }

        .score {
          color: #daa520;
        }

        &:hover {
          transform: translateY(-5px) scale(1.08);
        }
      }

      &.second-place {
        background: #f8f8f8;
        border-color: #c0c0c0;

        .teacher-name,
        .teacher-instrument,
        .score-label,
        .evaluation-count {
          color: #666;
        }

        .score {
          color: #888;
        }
      }

      &.third-place {
        background: #fff5ee;
        border-color: #cd7f32;

        .teacher-name,
        .teacher-instrument,
        .score-label,
        .evaluation-count {
          color: #8b4513;
        }

        .score {
          color: #cd7f32;
        }
      }
    }
  }

  .el-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid #e4e7ed;
    background: white;
    margin-bottom: 25px;

    &:last-child {
      margin-bottom: 0;
    }

    .card-header {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px;
      border-bottom: 1px solid #ebeef5;

      .el-tag {
        font-size: 13px;
        font-weight: 500;
        padding: 6px 12px;
        border-radius: 16px;
      }
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
        font-size: 14px;
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
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.05);
        border-color: #409eff;
      }
    }

    span {
      font-weight: 500;
      color: #303133;
      font-size: 14px;
    }
  }

  .score-cell {
    text-align: center;

    .el-tag {
      font-size: 14px;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 16px;
      border: none;
    }
  }

  .star-distribution {
    .star-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
      padding: 5px 8px;
      border-radius: 6px;
      background: #f8f9fa;
      transition: all 0.2s ease;

      &:hover {
        background: #e9ecef;
        transform: translateX(3px);
      }

      .star-label {
        width: 30px;
        font-size: 13px;
        font-weight: 500;
        color: #495057;
      }

      .star-count {
        width: 30px;
        font-size: 12px;
        color: #6c757d;
        text-align: right;
      }

      :deep(.el-progress-bar) {
        flex: 1;
        
        .el-progress-bar__outer {
          border-radius: 6px;
          background-color: #e9ecef;
        }
        
        .el-progress-bar__inner {
          border-radius: 6px;
        }
      }
    }
  }

  // 响应式设计
  @media (max-width: 1200px) {
    .top-three-container {
      .el-col {
        &:nth-child(2) {
          order: -1;
        }
      }
    }
  }

  @media (max-width: 768px) {
    padding: 15px;

    .ranking-title {
      font-size: 24px;
    }

    .top-three-container {
      .ranking-card {
        margin-bottom: 20px;
        margin: 0 5px;
        transform: scale(0.9);

        &.first-place {
          transform: scale(0.95);
        }
      }
    }

    .teacher-cell {
      flex-direction: column;
      text-align: center;
      gap: 8px;
    }

    .star-distribution {
      .star-bar {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
    }
  }

  @media (max-width: 480px) {
    .top-three-container {
      .ranking-card {
        padding: 15px 10px;
        margin: 0 3px;
        
        .medal {
          font-size: 28px;
          top: -14px;
        }
        
        .teacher-avatar {
          .el-avatar {
            width: 50px !important;
            height: 50px !important;
          }
        }
        
        .teacher-info {
          .teacher-name {
            font-size: 16px;
          }
          
          .score {
            font-size: 20px;
          }
        }
      }
    }
  }
}
</style>
