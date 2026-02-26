<template>
  <div class="notification-center">
    <!-- 通知图标按钮 -->
    <el-badge :value="unreadCount" :max="99" class="notification-badge">
      <el-button 
        type="text" 
        @click="toggleNotificationPanel"
        class="notification-btn"
      >
        <el-icon><Bell /></el-icon>
      </el-button>
    </el-badge>

    <!-- 通知面板 -->
    <el-drawer
      v-model="drawerVisible"
      title="通知中心"
      direction="rtl"
      size="400px"
      @close="handleDrawerClose"
    >
      <div class="notification-content">
        <!-- 顶部操作栏 -->
        <div class="notification-header">
          <div class="header-left">
            <span class="unread-count">未读: {{ unreadCount }}</span>
          </div>
          <div class="header-right">
            <el-button 
              type="primary" 
              size="small" 
              :disabled="unreadCount === 0"
              @click="markAllAsRead"
            >
             全部已读
            </el-button>
          </div>
        </div>

        <!-- 通知列表 -->
        <div class="notification-list" v-loading="loading">
          <div 
            v-for="notification in notifications" 
            :key="notification.id"
            class="notification-item"
            :class="{ 'unread': !notification.isRead }"
            @click="handleNotificationClick(notification)"
          >
            <div class="notification-icon">
              <el-icon :color="getNotificationColor(notification.type)">
                <component :is="getNotificationIcon(notification.type)" />
              </el-icon>
            </div>
            <div class="notification-body">
              <div class="notification-title">
                {{ notification.title }}
                <el-tag 
                  :type="getNotificationTypeTag(notification.type)" 
                  size="small"
                  class="type-tag"
                >
                  {{ getNotificationTypeText(notification.type) }}
                </el-tag>
              </div>
              <div class="notification-content">
                {{ notification.content }}
              </div>
              <div class="notification-time">
                {{ formatNotificationTime(notification.createdAt) }}
              </div>
            </div>
            <div class="notification-status">
              <div v-if="!notification.isRead" class="unread-dot"></div>
            </div>
          </div>

          <!--空状态 -->
          <el-empty 
            v-if="!loading && notifications.length === 0" 
            description="暂无通知"
            :image-size="100"
          />
        </div>

        <!--底部加载更多 -->
        <div class="notification-footer" v-if="notifications.length > 0">
          <el-button 
            type="primary" 
            link 
            @click="loadAllNotifications"
            :loading="loadingAll"
          >
            查看所有通知
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  getUnreadNotificationsCountService,
  getNotificationsService,
  getAllNotificationsService,
  markNotificationAsReadService,
  markAllNotificationsAsReadService
} from '@/api/common'
import { Bell, Warning, InfoFilled, SuccessFilled, Message } from '@element-plus/icons-vue'

//响应式数据
const drawerVisible = ref(false)
const unreadCount = ref(0)
const notifications = ref([])
const loading = ref(false)
const loadingAll = ref(false)
const notificationPolling = ref(null)

// 获取未读通知数量
const loadUnreadCount = async () => {
  try {
    const res = await getUnreadNotificationsCountService()
    if (res.code === 200) {
      unreadCount.value = res.data
    }
  } catch (error) {
    console.error('获取未读通知数量失败:', error)
  }
}

// 加载通知列表
const loadNotifications = async () => {
  loading.value = true
  try {
    const res = await getNotificationsService(10)
    if (res.code === 200) {
      notifications.value = res.data || []
    }
  } catch (error) {
    console.error('获取通知列表失败:', error)
    ElMessage.error('获取通知列表失败')
  } finally {
    loading.value = false
  }
}

// 加载所有通知
const loadAllNotifications = async () => {
  loadingAll.value = true
  try {
    const res = await getAllNotificationsService()
    if (res.code === 200) {
      notifications.value = res.data || []
      ElMessage.success('已加载所有通知')
    }
  } catch (error) {
    console.error('获取所有通知失败:', error)
    ElMessage.error('获取所有通知失败')
  } finally {
    loadingAll.value = false
  }
}

//标记单个通知为已读
const markAsRead = async (notificationId) => {
  try {
    const res = await markNotificationAsReadService(notificationId)
    if (res.code === 200) {
      // 更新本地状态
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) {
        notification.isRead = true
      }
      // 更新未读数量
      if (unreadCount.value > 0) {
        unreadCount.value--
      }
    }
  } catch (error) {
    console.error('标记通知为已读失败:', error)
  }
}

//标所有通知为已读
const markAllAsRead = async () => {
  try {
    const res = await markAllNotificationsAsReadService()
    if (res.code === 200) {
      // 更新所有通知状态
      notifications.value.forEach(notification => {
        notification.isRead = true
      })
      unreadCount.value = 0
      ElMessage.success('已全部标记为已读')
    }
  } catch (error) {
    console.error('标记全部通知为已读失败:', error)
    ElMessage.error('标记全部通知为已读失败')
  }
}

//切换通知面板
const toggleNotificationPanel = () => {
  drawerVisible.value = !drawerVisible.value
  if (drawerVisible.value) {
    loadNotifications()
  }
}

//处理通知点击
const handleNotificationClick = (notification) => {
  if (!notification.isRead) {
    markAsRead(notification.id)
  }
  //根据通知类型执行相应操作
  handleNotificationAction(notification)
}

// 处理通知操作
const handleNotificationAction = (notification) => {
  switch (notification.type) {
    case 'overdue_rental':
      //到乐器租借页面
      window.location.hash = '#/student/instrument-rental'
      break
    case 'rental_approved':
    case 'rental_rejected':
      //跳转到我的租借页面
      window.location.hash = '#/student/instrument-rental?tab=myRentals'
      break
    case 'reservation_approved':
    case 'reservation_rejected':
      //跳转到预约页面
      window.location.hash = '#/student/reserve'
      break
    default:
      //系统消息等，可以显示详情弹窗
      showNotificationDetail(notification)
  }
}

//显示通知详情
const showNotificationDetail = (notification) => {
  ElMessage.info({
    message: `${notification.title}: ${notification.content}`,
    duration: 5000,
    showClose: true
  })
}

// 处理抽屉关闭
const handleDrawerClose = () => {
  drawerVisible.value = false
}

// 获取通知图标
const getNotificationIcon = (type) => {
  const iconMap = {
    'overdue_rental': Warning,
    'rental_approved': SuccessFilled,
    'rental_rejected': Warning,
    'system_message': InfoFilled,
    'reservation_approved': SuccessFilled,
    'reservation_rejected': Warning
  }
  return iconMap[type] || Message
}

// 获取通知颜色
const getNotificationColor = (type) => {
  const colorMap = {
    'overdue_rental': '#F56C6C',
    'rental_approved': '#67C23A',
    'rental_rejected': '#F56C6C',
    'system_message': '#409EFF',
    'reservation_approved': '#67C23A',
    'reservation_rejected': '#F56C6C'
  }
  return colorMap[type] || '#909399'
}

// 获取通知类型标签
const getNotificationTypeTag = (type) => {
  const tagMap = {
    'overdue_rental': 'danger',
    'rental_approved': 'success',
    'rental_rejected': 'danger',
    'system_message': 'primary',
    'reservation_approved': 'success',
    'reservation_rejected': 'danger'
  }
  return tagMap[type] || 'info'
}

// 获取通知类型文本
const getNotificationTypeText = (type) => {
  const textMap = {
    'overdue_rental': '逾期提醒',
    'rental_approved': '租借批准',
    'rental_rejected': '租借拒绝',
    'system_message': '系统消息',
    'reservation_approved': '预约批准',
    'reservation_rejected': '预约拒绝'
  }
  return textMap[type] || '通知'
}

//格化通知时间
const formatNotificationTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) { // 1天内
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return `${Math.floor(diff / 86400000)}天前`
  }
}

//启动轮询
const startPolling = () => {
  //0秒检查一次未读通知
  notificationPolling.value = setInterval(() => {
    loadUnreadCount()
  }, 30000)
}

//停轮询
const stopPolling = () => {
  if (notificationPolling.value) {
    clearInterval(notificationPolling.value)
    notificationPolling.value = null
  }
}

//组件挂载时初始化
onMounted(() => {
  loadUnreadCount()
  startPolling()
})

//组件卸载时清理
onUnmounted(() => {
  stopPolling()
})

//方法给父组件
defineExpose({
  loadUnreadCount,
  loadNotifications
})
</script>

<style scoped lang="scss">
.notification-center {
  position: relative;
  
  .notification-badge {
    :deep(.el-badge__content) {
      background-color: #f56c6c;
      border: none;
    }
  }
  
  .notification-btn {
    font-size: 20px;
    color: #606266;
    border: none;
    background: transparent;
    padding: 8px;
    cursor: pointer;
    
    &:hover {
      color: #409eff;
      background-color: #f5f7fa;
    }
    
    &:focus {
      outline: none;
    }
  }
}

.notification-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #e4e7ed;
    margin-bottom: 15px;
    
    .header-left {
      .unread-count {
        font-weight: 600;
        color: #f56c6c;
      }
    }
  }
  
  .notification-list {
    flex: 1;
    overflow-y: auto;
    
    .notification-item {
      display: flex;
      padding: 15px;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        background-color: #f5f7fa;
      }
      
      &.unread {
        background-color: #f0f9ff;
        border-left: 3px solid #409eff;
      }
      
      .notification-icon {
        margin-right: 12px;
        display: flex;
        align-items: center;
      }
      
      .notification-body {
        flex: 1;
        min-width: 0;
        
        .notification-title {
          font-weight: 600;
          margin-bottom: 5px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          
          .type-tag {
            margin-left: 10px;
          }
        }
        
        .notification-content {
          color: #606266;
          font-size: 14px;
          margin-bottom: 8px;
          line-height: 1.4;
          word-break: break-all;
        }
        
        .notification-time {
          color: #909399;
          font-size: 12px;
        }
      }
      
      .notification-status {
        display: flex;
        align-items: center;
        margin-left: 10px;
        
        .unread-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #409eff;
        }
      }
    }
  }
  
  .notification-footer {
    text-align: center;
    padding: 15px 0;
    border-top: 1px solid #e4e7ed;
  }
}
</style>