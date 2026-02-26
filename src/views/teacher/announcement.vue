<template>
  <div class="announcement-container">
    <el-card shadow="never" style="border-radius: 8px; border: 1px solid #e4e7ed;">
      <template #header>
        <div class="card-header">
          <span>公告活动</span>
        </div>
      </template>

      <!-- 公告列表 -->
      <div class="announcement-list">
        <el-card
          v-for="item in announcementList"
          :key="item.id"
          class="announcement-item"
          shadow="hover"
        >
          <div class="announcement-header">
            <h3 class="title">{{ item.title }}</h3>
            <el-tag :type="getTypeTag(item.type)" size="small">{{ item.type }}</el-tag>
          </div>
          <p class="content">{{ item.content }}</p>
          <div class="announcement-footer">
            <span class="time">发布时间：{{ formatDateTime(item.createdAt) }}</span>
            <span v-if="item.startTime && item.endTime" class="valid-time">
              有效期：{{ formatDate(item.startTime) }} 至 {{ formatDate(item.endTime) }}
            </span>
          </div>
        </el-card>
      </div>

      <!-- 分页 -->
      <el-pagination
        v-if="total > 0"
        background
        layout="total, prev, pager, next"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handlePageChange"
        class="pagination"
      />

      <el-empty v-if="!loading && announcementList.length === 0" description="暂无公告" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAnnouncementsService } from '@/api/common'

const loading = ref(false)
const announcementList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const loadAnnouncementList = async () => {
  loading.value = true
  try {
    const res = await getAnnouncementsService({
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })
    if (res.code === 200) {
      announcementList.value = res.data?.records || []
      total.value = res.data?.total || 0
    } else {
      ElMessage.error(res.message || '加载失败')
    }
  } catch (err) {
    ElMessage.error('网络错误，请重试')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  loadAnnouncementList()
}

const getTypeTag = (type) => {
  const map = { 通知: 'primary', 活动: 'success', 系统: 'warning', 紧急: 'danger' }
  return map[type] || 'info'
}

const formatDate = (str) => {
  if (!str) return ''
  const date = new Date(str)
  if (isNaN(date.getTime())) return str
  return date.toLocaleDateString('zh-CN')
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
  loadAnnouncementList()
})
</script>

<style scoped lang="scss">
.announcement-container {
  padding: 20px;
  background-color: #f5f7fa;

  .card-header {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }

  .announcement-list {
    .announcement-item {
      margin-bottom: 16px;

      .announcement-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .title {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
          margin: 0;
        }
      }

      .content {
        color: #606266;
        line-height: 1.6;
        margin-bottom: 12px;
      }

      .announcement-footer {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        color: #909399;

        .valid-time {
          color: #409eff;
        }
      }
    }
  }

  .pagination {
    margin-top: 24px;
    text-align: right;
  }
}
</style>