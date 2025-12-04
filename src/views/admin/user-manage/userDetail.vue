<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { userGetDetailService } from '@/api/user'
import { formatTime } from '@/utils/format'

const route = useRoute()
const router = useRouter()

const searchId = ref('')
const user = ref(null)
const loading = ref(false)

// 判断头像是否有效：非 null / undefined / '' / 'null'
const isValidAvatar = (avatar) => {
  return avatar != null && avatar !== '' && avatar !== 'null'
}

let currentRequestId = 0

const fetchUser = async (id) => {
  if (!id) {
    user.value = null
    return
  }

  const requestId = ++currentRequestId
  loading.value = true
  const startTime = Date.now()

  try {
    const res = await userGetDetailService(id)
    if (requestId !== currentRequestId) return
    user.value = res.data
    if (route.query.id !== id) {
      router.replace({ path: '/user1/detail', query: { id } })
    }
  } catch (err) {
    if (requestId !== currentRequestId) return
    console.error('获取用户失败:', err)
    ElMessage.error('用户不存在或获取失败')
    user.value = null
  } finally {
    if (requestId !== currentRequestId) return
    const elapsed = Date.now() - startTime
    const minDuration = 300
    if (elapsed < minDuration) {
      await new Promise(resolve => setTimeout(resolve, minDuration - elapsed))
    }
    loading.value = false
  }
}

const handleSearch = () => {
  const id = searchId.value.trim()
  if (!id) {
    ElMessage.warning('请输入用户ID')
    return
  }
  fetchUser(id)
}

const clear = () => {
  searchId.value = ''
  user.value = null
  router.replace('/user1/detail')
}

watch(
  () => route.query.id,
  (newId) => {
    if (newId) {
      searchId.value = newId
      fetchUser(newId)
    } else {
      searchId.value = ''
      user.value = null
    }
  },
  { immediate: true }
)
</script>
<template>
  <el-card>
    <template #header>
      <div class="detail-header">
        <el-input
          v-model="searchId"
          placeholder="请输入用户ID"
          style="width: 200px"
          @keyup.enter="handleSearch"
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="clear">清空</el-button>
      </div>
    </template>

    <!-- 内容区域：带最小高度 + 过渡 -->
    <div class="detail-content">
      <transition name="fade" mode="out-in">
        <el-skeleton v-if="loading" :rows="12" animated key="loading" />

        <el-empty
          v-else-if="!user"
          description="未找到用户信息"
          key="empty"
        />

        <div v-else class="user-detail" key="detail">
          <!-- 🎯 头像区 -->
          <div class="user-avatar-section">
            <div class="avatar-container">
              <img
                v-if="isValidAvatar(user.avatar)"
                :src="'http://localhost:8080' + user.avatar"
                alt=""
                class="avatar-large"
                loading="lazy"
              />
              <img
                v-else
                src="@/assets/user.png"
                alt="默认头像"
                class="avatar-large default"
              />
            </div>
            <div class="user-info">
              <h2 class="user-name">{{ user.name }}</h2>
              <p class="user-role">角色：{{ user.role }}</p>
            </div>
          </div>

          <!-- 用户详情 -->
          <el-descriptions
            title=""
            :column="2"
            border
            class="user-descriptions"
          >
            <el-descriptions-item label="用户ID">{{ user.id }}</el-descriptions-item>
            <el-descriptions-item label="用户名">{{ user.username }}</el-descriptions-item>
            <el-descriptions-item label="真实姓名">{{ user.name }}</el-descriptions-item>
            <el-descriptions-item label="角色">{{ user.role }}</el-descriptions-item>
            <el-descriptions-item label="电子邮箱">{{ user.email }}</el-descriptions-item>
            <el-descriptions-item label="手机号码">{{ user.phone }}</el-descriptions-item>
            <el-descriptions-item label="性别">{{ user.gender }}</el-descriptions-item>
            <el-descriptions-item label="联系地址">{{ user.address }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatTime(user.createdAt) }}</el-descriptions-item>
          </el-descriptions>

          <!-- 教学课程 -->
          <div class="section">
            <h3>正在授课的课程</h3>
            <el-table
              :data="user.teachingLessons"
              style="width: 100%"
              v-if="user.teachingLessons && user.teachingLessons.length > 0"
            >
              <el-table-column prop="courseName" label="课程名称" />
              <el-table-column prop="startTime" label="开始时间" />
              <el-table-column prop="peerName" label="学生姓名" />
              <el-table-column prop="peerRole" label="学生身份" />
              <el-table-column prop="peerAvatar" label="学生头像" width="80">
                <template #default="{ row }">
                  <img
                    v-if="isValidAvatar(row.peerAvatar)"
                    :src="'http://localhost:8080' + row.peerAvatar"
                    alt=""
                    class="avatar-small"
                    loading="lazy"
                  />
                  <span v-else>—</span>
                </template>
              </el-table-column>
            </el-table>
            <p v-else>暂无授课课程</p>
          </div>

          <!-- 报名课程 -->
          <div class="section">
            <h3>已报名课程</h3>
            <el-table
              :data="user.enrolledLessons"
              style="width: 100%"
              v-if="user.enrolledLessons && user.enrolledLessons.length > 0"
            >
              <el-table-column prop="courseName" label="课程名称" />
              <el-table-column prop="startTime" label="开始时间" />
              <el-table-column prop="status" label="状态" />
              <el-table-column prop="peerName" label="讲师姓名" />
                <el-table-column prop="peerRole" label="讲师身份" />
                <el-table-column prop="peerAvatar" label="讲师头像" width="80" >
                <template #default="{ row }">
                  <img
                    v-if="isValidAvatar(row.peerAvatar)"
                    :src="'http://localhost:8080' + row.peerAvatar"
                    alt=""
                    class="avatar-small"
                    loading="lazy"
                  />
                  <span v-else>—</span>
                </template>
                </el-table-column>
            </el-table>
            <p v-else>暂无报名课程</p>
          </div>
        </div>
      </transition>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
.detail-header {
  display: flex;
  gap: 12px;
  align-items: center;
}

.detail-content {
  min-height: 400px;
  @media (min-width: 768px) {
    min-height: 600px;
  }
  position: relative;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.user-detail {
  margin-top: 16px;
}

.user-avatar-section {
  text-align: center;       // 所有内容水平居中
  padding: 24px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 24px;

  .avatar-container {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    overflow: hidden;
    background-color: #f5f5f5;
    margin: 0 auto;         // 头像自身居中
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .avatar-large {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border: 2px solid #ddd;
  }

  .avatar-large.default {
    background-color: #f5f5f5;
    color: #999;
    font-size: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .user-info {
    margin-top: 16px;       // 控制头像与文字的间距
    text-align: center;     // 名字和角色也居中
  }

  .user-name {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #333;
  }

  .user-role {
    margin: 4px 0 0;
    color: #666;
    font-size: 14px;
  }
}

.user-descriptions {
  margin-top: 20px;
  background-color: #f9f9f9;
  border-radius: 6px;
  overflow: hidden;

  :deep(.el-descriptions__body .el-descriptions__item) {
    padding: 12px 16px;
    border-bottom: 1px solid #eee;

    &:last-child {
      border-bottom: none;
    }

    .el-descriptions__label {
      width: 120px;
      text-align: right;
      padding-right: 12px;
      color: #666;
      font-weight: 500;
    }

    .el-descriptions__content {
      flex: 1;
      color: #333;
      word-break: break-all;
      text-align: left;
    }
  }
}

.section {
  margin-top: 24px;

  h3 {
    margin: 0 0 12px;
    font-size: 16px;
    color: #333;
    font-weight: 600;
  }
}

.avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}
</style>