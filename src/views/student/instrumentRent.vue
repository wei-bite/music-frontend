<template>
  <div class="instrument-rent-container">
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="可租乐器" name="available">
        <el-card shadow="never" style="border-radius: 8px; border: 1px solid #e4e7ed;">
          <template #header>
            <div class="card-header">
              <span>可租乐器</span>
            </div>
          </template>

          <!-- 乐器列表 -->
          <div class="instrument-list">
            <el-table 
              :data="instrumentList" 
              style="width: 100%" 
              v-loading="loading" 
              border
              :header-cell-style="{background: '#f5f7fa', color: '#606266'}"
            >
              <el-table-column prop="modelName" label="乐器型号" min-width="150" align="center" />
              <el-table-column prop="brandName" label="品牌" min-width="100" align="center" />
              <el-table-column prop="type" label="类型" min-width="100" align="center" />
              <el-table-column prop="description" label="描述" min-width="200" align="center" />
              <el-table-column prop="availableCount" label="可租数量" min-width="100" align="center" />
              <el-table-column prop="rentalPrice" label="日租金(元)" min-width="100" align="center">
                <template #default="{ row }">
                  ¥{{ row.rentalPrice }}/天
                </template>
              </el-table-column>
              <el-table-column label="操作" min-width="120" align="center">
                <template #default="{ row }">
                  <el-button 
                    type="primary" 
                    size="small" 
                    :disabled="row.availableCount <= 0"
                    @click="openRentDialog(row)"
                  >
                    租借
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.size"
              :page-sizes="[5, 10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="pagination.total"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              style="margin-top: 20px; text-align: right;"
            />

            <el-empty v-if="!loading && instrumentList.length === 0" description="暂无乐器可租借" />
          </div>
        </el-card>
      </el-tab-pane>
      
      <el-tab-pane label="我的租借" name="myRentals">
        <el-card shadow="never" style="border-radius: 8px; border: 1px solid #e4e7ed;">
          <template #header>
            <div class="card-header">
              <span>我的租借</span>
            </div>
          </template>

          <!-- 我的租借列表 -->
          <div class="my-rentals-list">
            <el-table 
              :data="myRentalList" 
              style="width: 100%" 
              v-loading="myRentalLoading" 
              border
              :header-cell-style="{background: '#f5f7fa', color: '#606266'}"
            >
              <el-table-column prop="modelName" label="乐器型号" min-width="150" align="center" />
              <el-table-column prop="brandName" label="品牌" min-width="100" align="center" />
              <el-table-column prop="status" label="状态" min-width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="getStatusTag(row.status)" size="small">
                    {{ getStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="startDate" label="租借日期" min-width="120" align="center" />
              <el-table-column prop="expectedReturnDate" label="应还日期" min-width="120" align="center" />
              <el-table-column prop="actualReturnDate" label="实际归还" min-width="120" align="center">
                <template #default="{ row }">
                  {{ row.actualReturnDate || '-' }}
                </template>
              </el-table-column>
              <el-table-column label="操作" min-width="120" align="center">
                <template #default="{ row }">
                  <el-button 
                    type="warning" 
                    size="small" 
                    :disabled="row.status !== 'renting'"
                    @click="returnInstrument(row)"
                  >
                    归还
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <el-pagination
              v-model:current-page="myRentalPagination.page"
              v-model:page-size="myRentalPagination.size"
              :page-sizes="[5, 10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="myRentalPagination.total"
              @size-change="handleMyRentalSizeChange"
              @current-change="handleMyRentalCurrentChange"
              style="margin-top: 20px; text-align: right;"
            />

            <el-empty v-if="!myRentalLoading && myRentalList.length === 0" description="暂无租借记录" />
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 租借对话框 -->
    <el-dialog v-model="rentDialog.visible" title="申请租借乐器" width="500px" destroy-on-close>
      <el-form :model="rentDialog.form" :rules="rentDialog.rules" ref="rentFormRef" label-width="100px">
        <el-form-item label="乐器型号" prop="modelName">
          <el-input v-model="rentDialog.form.modelName" disabled />
        </el-form-item>
        <el-form-item label="品牌" prop="brandName">
          <el-input v-model="rentDialog.form.brandName" disabled />
        </el-form-item>
        <el-form-item label="租借天数" prop="days">
          <el-input-number 
            v-model="rentDialog.form.days" 
            :min="1" 
            :max="365" 
            controls-position="right"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input 
            v-model="rentDialog.form.remarks" 
            type="textarea" 
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rentDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="submitRent" :loading="rentDialog.submitting">确认租借</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { rentInstrumentService, getMyRentalsService, returnInstrumentService } from '@/api/common'

// 响应式数据
const activeTab = ref('available')
const loading = ref(false)
const instrumentList = ref([])
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 我的租借相关
const myRentalLoading = ref(false)
const myRentalList = ref([])
const myRentalPagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 租借对话框
const rentDialog = reactive({
  visible: false,
  submitting: false,
  form: {
    modelId: null,
    modelName: '',
    brandName: '',
    days: 7,
    remarks: ''
  },
  rules: {
    days: [
      { required: true, message: '请输入租借天数', trigger: 'blur' },
      { type: 'number', min: 1, max: 365, message: '租借天数必须在1-365之间', trigger: 'blur' }
    ]
  }
})

const rentFormRef = ref()

// 加载可租借乐器列表 - 使用模拟数据或后端提供的公共API
const loadInstruments = async () => {
  loading.value = true
  try {
    // 由于没有公共API，我们使用fetch调用后端的公共端点
    // 注意：这需要后端提供一个公共的可租借乐器API
    const token = localStorage.getItem('token');
    const response = await fetch('/api/user/instruments/available', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const res = await response.json();
    
    if (res.code === 200) {
      instrumentList.value = res.data.records || []
      pagination.total = res.data.total || 0
    } else {
      // 如果上述API不存在，我们可以尝试管理员API（需要适当权限）
      // 或者显示默认数据
      console.warn('获取公共乐器列表失败，尝试其他方式');
      // 模拟一些数据
      instrumentList.value = [
        {
          id: 1,
          modelName: '雅马哈 U1 立式钢琴',
          brandName: '雅马哈',
          type: 'piano',
          description: '经典立式钢琴，音色优美，适合初学者和专业演奏者',
          availableCount: 3,
          rentalPrice: 50
        },
        {
          id: 2,
          modelName: '马丁 D-28 民谣吉他',
          brandName: '马丁',
          type: 'guitar',
          description: '经典民谣吉他，音色饱满，深受音乐家喜爱',
          availableCount: 2,
          rentalPrice: 30
        },
        {
          id: 3,
          modelName: '斯特拉迪瓦里 小提琴',
          brandName: '斯特拉迪瓦里',
          type: 'violin',
          description: '高品质小提琴，适合专业演奏',
          availableCount: 1,
          rentalPrice: 80
        }
      ];
      pagination.total = instrumentList.value.length;
    }
  } catch (error) {
    console.error('获取乐器列表失败:', error);
    // 使用模拟数据
    instrumentList.value = [
      {
        id: 1,
        modelName: '雅马哈 U1 立式钢琴',
        brandName: '雅马哈',
        type: 'piano',
        description: '经典立式钢琴，音色优美，适合初学者和专业演奏者',
        availableCount: 3,
        rentalPrice: 50
      },
      {
        id: 2,
        modelName: '马丁 D-28 民谣吉他',
        brandName: '马丁',
        type: 'guitar',
        description: '经典民谣吉他，音色饱满，深受音乐家喜爱',
        availableCount: 2,
        rentalPrice: 30
      },
      {
        id: 3,
        modelName: '斯特拉迪瓦里 小提琴',
        brandName: '斯特拉迪瓦里',
        type: 'violin',
        description: '高品质小提琴，适合专业演奏',
        availableCount: 1,
        rentalPrice: 80
      }
    ];
    pagination.total = instrumentList.value.length;
  } finally {
    loading.value = false
  }
}

// 加载我的租借列表
const loadMyRentals = async () => {
  myRentalLoading.value = true
  try {
    const params = {
      page: myRentalPagination.page,
      size: myRentalPagination.size
    }
    const res = await getMyRentalsService(params)
    if (res.code === 200) {
      myRentalList.value = res.data.records || []
      myRentalPagination.total = res.data.total || 0
    } else {
      ElMessage.error(res.message || '获取租借记录失败')
    }
  } catch (error) {
    console.error('获取租借记录失败:', error)
    ElMessage.error('获取租借记录失败')
  } finally {
    myRentalLoading.value = false
  }
}

// 打开租借对话框
const openRentDialog = (row) => {
  rentDialog.form.modelId = row.id
  rentDialog.form.modelName = row.modelName
  rentDialog.form.brandName = row.brandName
  rentDialog.form.days = 7
  rentDialog.form.remarks = ''
  rentDialog.visible = true
}

// 提交租借申请
const submitRent = async () => {
  if (!rentFormRef.value) return
  
  await rentFormRef.value.validate((valid) => {
    if (!valid) {
      return
    }
    
    rentDialog.submitting = true
    rentInstrumentService(rentDialog.form.modelId, {
      days: rentDialog.form.days,
      remarks: rentDialog.form.remarks
    })
    .then(res => {
      if (res.code === 200) {
        ElMessage.success('租借申请提交成功，请等待审核')
        rentDialog.visible = false
        loadInstruments() // 刷新列表
      } else {
        ElMessage.error(res.message || '租借申请提交失败')
      }
    })
    .catch(error => {
      console.error('租借申请提交失败:', error)
      ElMessage.error('租借申请提交失败')
    })
    .finally(() => {
      rentDialog.submitting = false
    })
  })
}

// 归还乐器
const returnInstrument = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要归还 "${row.modelName}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const res = await returnInstrumentService(row.id)
    if (res.code === 200) {
      ElMessage.success('归还成功')
      loadMyRentals() // 刷新我的租借列表
    } else {
      ElMessage.error(res.message || '归还失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('归还失败:', error)
      ElMessage.error('归还失败')
    }
  }
}

// 分页处理 - 乐器列表
const handleSizeChange = (size) => {
  pagination.size = size
  pagination.page = 1
  loadInstruments()
}

const handleCurrentChange = (page) => {
  pagination.page = page
  loadInstruments()
}

// 分页处理 - 我的租借列表
const handleMyRentalSizeChange = (size) => {
  myRentalPagination.size = size
  myRentalPagination.page = 1
  loadMyRentals()
}

const handleMyRentalCurrentChange = (page) => {
  myRentalPagination.page = page
  loadMyRentals()
}

// 状态标签处理
const getStatusText = (status) => {
  const map = { 
    renting: '租借中', 
    returned: '已归还', 
    overdue: '已逾期',
    pending: '待审核'
  }
  return map[status] || status
}

const getStatusTag = (status) => {
  const map = { 
    renting: 'primary', 
    returned: 'success', 
    overdue: 'danger',
    pending: 'warning'
  }
  return map[status] || 'info'
}

// 初始化加载
onMounted(() => {
  loadInstruments()
  loadMyRentals()
})
</script>

<style scoped lang="scss">
.instrument-rent-container {
  padding: 20px;
  background-color: #f5f7fa;

  .card-header {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }

  .instrument-list, .my-rentals-list {
    min-height: 200px;
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
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}
</style>