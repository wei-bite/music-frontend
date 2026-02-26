<template>
  <GenericListManager
    title="琴房管理"
    :columns="columns"
    :list="list"
    :total="list.length"
    :loading="loading"
    :pagination="pagination"
    :searchParams="{}"
    :searchFields="[]"
    @create="handleCreate"
    @edit="handleEdit"
    @delete="handleDelete"
  >
    <!-- 自定义“状态”列显示为标签 -->
    <template #col-status="{ row }">
      <el-tag :type="getStatusTagType(row.status)">
        {{ getStatusText(row.status) }}
      </el-tag>
    </template>
  </GenericListManager>

  <!-- 新增/编辑弹窗 -->
  <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px" @close="resetForm">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="琴房名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入琴房名称" />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="form.type" placeholder="请选择类型" style="width: 100%">
          <el-option label="VIP" value="VIP" />
          <el-option label="Standard" value="Standard" />
          <el-option label="Large" value="Large" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status" v-if="isEditMode">
        <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
          <el-option label="可用" value="available" />
          <el-option label="占用中" value="occupied" />
          <el-option label="维护中" value="maintenance" />
        </el-select>
      </el-form-item>
      <el-form-item label="容纳人数" prop="capacity">
        <el-input-number v-model="form.capacity" :min="1" :max="100" controls-position="right" style="width: 100%" />
      </el-form-item>
      <el-form-item label="设备描述" prop="equipment">
        <el-input v-model="form.equipment" type="textarea" :rows="2" placeholder="例如：钢琴、空调、隔音墙" />
      </el-form-item>
      <el-form-item label="位置" prop="location">
        <el-input v-model="form.location" placeholder="例如：A栋3楼301" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import GenericListManager from '@/components/GenericListManager.vue'

// API
import {
  getPracticeRoomListService,
  createPracticeRoomService,
  updatePracticeRoomService,
  deletePracticeRoomService
} from '@/api/admin/practice-rooms'

// 列配置
const columns = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '名称', minWidth: 120 },
  { prop: 'type', label: '类型', width: 100 },
  { prop: 'status', label: '状态', width: 100 },
  { prop: 'capacity', label: '容纳人数', width: 100 },
  { prop: 'equipment', label: '设备', minWidth: 150 },
  { prop: 'location', label: '位置', minWidth: 120 }
]

// 数据
const list = ref([])
const loading = ref(false)
const pagination = reactive({ page: 1, size: 999 }) // 因为接口不分页，设大一点

// 弹窗
const dialogVisible = ref(false)
const isEditMode = ref(false)
const submitting = ref(false)
const formRef = ref(null)

const form = reactive({
  id: null,
  name: '',
  type: '',
  status: 'available',
  capacity: 1,
  equipment: '',
  location: ''
})

const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  capacity: [{ required: true, message: '请输入容纳人数', trigger: 'blur' }]
}

const dialogTitle = computed(() => isEditMode.value ? '编辑琴房' : '新增琴房')

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getPracticeRoomListService()
    if (res.code === 200) {
      list.value = res.data || []
    } else {
      ElMessage.error(res.message || '获取失败')
    }
  } catch (err) {
    ElMessage.error('网络错误')
    console.error(err)
  } finally {
    loading.value = false
  }
}

// 操作
const handleCreate = () => {
  isEditMode.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEditMode.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDelete = (id) => {
  ElMessageBox.confirm('确定删除该琴房？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deletePracticeRoomService(id)
      ElMessage.success('删除成功')
      loadData()
    } catch (err) {
      ElMessage.error(err.response?.data?.message || '删除失败')
    }
  })
}

const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (isEditMode.value) {
        await updatePracticeRoomService(form.id, {
          name: form.name,
          type: form.type,
          capacity: form.capacity,
          equipment: form.equipment,
          location: form.location,
          status: form.status
        })
      } else {
        await createPracticeRoomService({
          name: form.name,
          type: form.type,
          capacity: form.capacity,
          equipment: form.equipment,
          location: form.location
        })
      }
      ElMessage.success(isEditMode.value ? '更新成功' : '新增成功')
      dialogVisible.value = false
      loadData()
    } catch (err) {
      ElMessage.error(err.response?.data?.message || (isEditMode.value ? '更新失败' : '新增失败'))
    } finally {
      submitting.value = false
    }
  })
}

const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(form, {
    id: null,
    name: '',
    type: '',
    status: 'available',
    capacity: 1,
    equipment: '',
    location: ''
  })
}

// 初始化
onMounted(() => {
  loadData()
})

// 状态映射
const getStatusText = (status) => {
  switch (status) {
    case 'available': return '可用'
    case 'occupied': return '占用中'
    case 'maintenance': return '维护中'
    default: return status
  }
}

const getStatusTagType = (status) => {
  switch (status) {
    case 'available': return 'success'
    case 'occupied': return 'warning'
    case 'maintenance': return 'danger'
    default: return 'info'
  }
}
</script>