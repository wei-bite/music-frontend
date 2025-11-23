<script setup>
import { ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { userUploadAvatarService } from '@/api/user'
import { useUserStore } from '@/stores'

const userStore = useUserStore()

// 响应式数据
const fileInputRef = ref(null)
const newFile = ref(null)           // 当前选中的文件对象
const previewUrl = ref('')          // 预览 URL
const loading = ref(false)

// 处理文件选择
const handleFileChange = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  // 校验文件类型
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg']
  if (!validTypes.includes(file.type)) {
    ElMessage.error('仅支持 JPG/PNG 格式的图片')
    resetInput()
    return
  }

  // 校验文件大小（2MB = 2 * 1024 * 1024）
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过 2MB')
    resetInput()
    return
  }

  newFile.value = file

  // 生成本地预览 URL
  const url = URL.createObjectURL(file)
  previewUrl.value = url

  // 清理之前的 URL（避免内存泄漏）
  nextTick(() => {
    if (previewUrl.value && previewUrl.value !== url) {
      URL.revokeObjectURL(previewUrl.value)
    }
  })
}

// 上传头像
const handleSubmit = async () => {
  if (!newFile.value) {
    ElMessage.warning('请先选择一张图片')
    return
  }

  loading.value = true
  try {
    const res = await userUploadAvatarService(newFile.value)
    
    // 确保这里 res.data 的结构是你期望的
    const newAvatarPath = res.data // 或者是 res.data.avatar 根据实际结构调整
    
    if (!newAvatarPath) {
      throw new Error('未从服务器接收到头像路径')
    }
    
    const fullAvatarUrl = newAvatarPath.startsWith('http') ? 
        newAvatarPath : 'http://localhost:8080' + newAvatarPath
    
    userStore.updateUserInfo({ avatar: fullAvatarUrl })
    
    ElMessage.success('头像更新成功！')
    reset()
  } catch (error) {
    console.error('上传失败:', error)
    const msg = error.response?.data?.message || '头像上传失败，请重试'
    ElMessage.error(msg)
  } finally {
    loading.value = false
  }
}

// 取消 / 重置
const reset = () => {
  newFile.value = null
  previewUrl.value = ''
  resetInput()
}

// 重置文件输入框（使其能重复选择同一张图）
const resetInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}
</script>

<template>
  <PageContainer title="更换头像">
    <div class="avatar-change-container">
      <!-- 头像区域 -->
      <div class="avatar-wrapper">
        <el-avatar
          :size="140"
          :src="previewUrl || userStore.avatar || '@/assets/user.png'"
          fit="cover"
          style="border: 3px solid #e6f7ff; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
        />
        <el-button
          type="primary"
          @click="fileInputRef?.click()"
          style="margin-top: 16px; padding: 8px 20px;"
        >
          选择图片
        </el-button>
      </div>

      <!-- 提示信息 -->
      <p class="tip">支持 jpg/png 格式，大小不超过 2MB</p>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button @click="reset">取消</el-button>
        <el-button
          type="primary"
          :disabled="!newFile"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ loading ? '上传中...' : '保存头像' }}
        </el-button>
      </div>

      <!-- 隐藏文件输入 -->
      <input
        ref="fileInputRef"
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        style="display: none"
        @change="handleFileChange"
      />
    </div>
  </PageContainer>
</template>

<style lang="scss" scoped>
.avatar-change-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  max-width: 400px;
  margin: 0 auto;
}

.avatar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.tip {
  color: #999;
  font-size: 12px;
  text-align: center;
  margin-bottom: 24px;
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}
</style>