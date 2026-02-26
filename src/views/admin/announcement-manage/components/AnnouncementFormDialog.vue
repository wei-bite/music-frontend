<!-- AnnouncementFormDialog.vue -->
<template>
  <el-dialog
    :title="dialogTitle"
    v-model="visible"
    width="700px"
    @closed="handleClose"
    :close-on-click-modal="false"
    :destroy-on-close="true"
  >
    <!-- 调试信息（上线前可删） -->
    <!-- <div style="color: red; margin-bottom: 10px">
      Mode: {{ props.mode }} | Disabled: {{ isViewMode }}
    </div> -->

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      :disabled="isViewMode"
    >
      <!-- 标题 -->
      <el-form-item label="公告标题" prop="title">
        <el-input v-model.trim="form.title" placeholder="请输入公告标题" />
      </el-form-item>

      <!-- 类型 -->
      <el-form-item label="公告类型" prop="type">
        <el-select v-model="form.type" placeholder="请选择类型" style="width: 100%">
          <el-option value="notice" label="通知公告" />
          <el-option value="activity" label="活动公告" />
          <el-option value="promotion" label="促销公告" />
        </el-select>
      </el-form-item>

      <!-- 生效时间 -->
      <el-form-item label="生效时间" required>
        <el-col :span="11">
          <el-form-item prop="startTime" style="margin-bottom: 0">
            <el-date-picker
              v-model="form.startTime"
              type="datetime"
              placeholder="开始时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DDTHH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col class="text-center" :span="2">
          <span class="text-gray-500">至</span>
        </el-col>
        <el-col :span="11">
          <el-form-item prop="endTime" style="margin-bottom: 0">
            <el-date-picker
              v-model="form.endTime"
              type="datetime"
              placeholder="结束时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DDTHH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-form-item>

      <!-- 封面图 -->
      <el-form-item label="封面图片">
        <el-input v-model="form.coverUrl" placeholder="请输入封面图片URL（可选）" />
        <div v-if="form.coverUrl" class="mt-2">
          <img :src="form.coverUrl" alt="封面预览" style="max-height: 100px; max-width: 200px" />
        </div>
      </el-form-item>

      <!-- 跳转链接 -->
      <el-form-item label="跳转链接">
        <el-input v-model="form.jumpUrl" placeholder="请输入跳转链接（可选）" />
      </el-form-item>

      <!-- 公告内容 -->
      <el-form-item label="公告内容" prop="content">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="5"
          placeholder="请输入公告内容"
        />
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button
        v-if="!isViewMode"
        type="primary"
        :loading="submitting"
        @click="handleSubmit"
      >
        {{ props.mode === 'create' ? '创建' : '更新' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, nextTick, computed } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

// API
import {
  createAnnouncementService,
  updateAnnouncementService,
  getAnnouncementDetailService
} from '@/api/admin/announcement'

const props = defineProps({
  modelValue: Boolean,
  mode: {
    type: String,
    default: 'create',
    validator: (val) => ['create', 'edit', 'view'].includes(val)
  },
  announcementId: [Number, String]
})

const emit = defineEmits(['update:modelValue', 'success'])

// ====== 响应式状态 ======
const visible = ref(false)
const submitting = ref(false)
const formRef = ref(null)

const form = reactive({
  title: '',
  content: '',
  type: '',        // 必须是 'notice' / 'activity' / 'promotion'
  coverUrl: '',
  jumpUrl: '',
  startTime: '',   // YYYY-MM-DDTHH:mm:ss
  endTime: ''      // YYYY-MM-DDTHH:mm:ss
})

// ====== ✅ 使用 computed 保证响应性 ======
const isViewMode = computed(() => props.mode === 'view')
const dialogTitle = computed(() => {
  const map = {
    create: '新建公告',
    edit: '编辑公告',
    view: '公告详情'
  }
  return map[props.mode] || '公告'
})

// ====== 表单校验规则 ======
const validateEndTime = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请选择结束时间'))
  } else if (form.startTime && dayjs(value).isBefore(dayjs(form.startTime))) {
    callback(new Error('结束时间必须晚于开始时间'))
  } else {
    callback()
  }
}

const rules = {
  title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择公告类型', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, validator: validateEndTime, trigger: 'change' }],
  content: [{ required: true, message: '请输入公告内容', trigger: 'blur' }]
}

// ====== 加载详情（edit/view 模式） ======
const loadDetail = async () => {
  if (props.mode === 'create') return

  try {
    const res = await getAnnouncementDetailService(props.announcementId)
    if (res.code === 200) {
      const data = res.data
      Object.assign(form, {
        title: data.title || '',
        content: data.content || '',
        type: data.type || '',
        coverUrl: data.coverUrl || '',
        jumpUrl: data.jumpUrl || '',
        startTime: data.startTime || '',
        endTime: data.endTime || ''
      })
    }
  } catch (err) {
    ElMessage.error('加载公告详情失败')
    visible.value = false
  }
}

// ====== 提交表单（关键！确保格式与 Postman 一致） ======
const handleSubmit = async () => {
  if (isViewMode.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    // ✅ 构造与 Postman 完全一致的 payload
    const payload = {
      title: form.title,
      content: form.content,
      type: form.type,
      coverUrl: form.coverUrl || '',
      jumpUrl: form.jumpUrl || '',
      startTime: form.startTime,
      endTime: form.endTime
    }

    console.log('提交数据:', payload) // 🔍 调试用

    const apiCall =
      props.mode === 'create'
        ? createAnnouncementService(payload)
        : updateAnnouncementService(props.announcementId, payload)

    const res = await apiCall
    if (res.code === 200) {
      ElMessage.success(res.msg || (props.mode === 'create' ? '公告创建成功' : '公告更新成功'))
      emit('success')
      visible.value = false
    }
  } catch (err) {
    console.error('请求失败:', err)
    ElMessage.error('请求数据格式不正确，请检查 JSON 格式')
  } finally {
    submitting.value = false
  }
}

// ====== 关闭处理 ======
const handleClose = () => {
  emit('update:modelValue', false)
  nextTick(() => {
    formRef.value?.resetFields()
  })
}

// ====== 监听弹窗开关 ======
watch(
  () => props.modelValue,
  async (val) => {
    visible.value = val
    if (val) {
      // 重置表单
      Object.assign(form, {
        title: '',
        content: '',
        type: '',
        coverUrl: '',
        jumpUrl: '',
        startTime: '',
        endTime: ''
      })
      await loadDetail()
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.text-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.mt-2 {
  margin-top: 8px;
}
</style>