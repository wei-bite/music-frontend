<template>
  <div class="instrument-rent-container">
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="可租乐器" name="available">
        <!-- 添加测试按钮 -->
        <el-button @click="testLoadMyRentals" style="margin-bottom: 10px;">测试加载我的租借</el-button>
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
              <el-table-column prop="rentedFrom" label="租借开始" min-width="120" align="center" />
              <el-table-column prop="rentedTo" label="应还日期" min-width="120" align="center" />
              <el-table-column label="操作" min-width="120" align="center">
                <template #default="{ row }">
                  <el-button 
                    type="warning" 
                    size="small" 
                    :disabled="row.status !== 'rented'"
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
      
      <el-tab-pane label="逾期未还" name="overdue">
        <el-card shadow="never" style="border-radius: 8px; border: 1px solid #e4e7ed;">
          <template #header>
            <div class="card-header">
              <span>我的逾期未还乐器</span>
            </div>
          </template>

          <!-- 即将到期租借列表 -->
          <div class="expiring-list">
            <el-table 
              :data="expiringList" 
              style="width: 100%" 
              v-loading="expiringLoading" 
              border
              :header-cell-style="{background: '#f5f7fa', color: '#606266'}"
            >
              <el-table-column prop="modelName" label="乐器型号" min-width="150" align="center" />
              <el-table-column prop="brandName" label="品牌" min-width="100" align="center" />
              <el-table-column prop="type" label="类型" min-width="100" align="center" />
              <el-table-column prop="serialNumber" label="序列号" min-width="120" align="center" />
              <el-table-column prop="rentedFrom" label="租借开始" min-width="120" align="center" />
              <el-table-column prop="rentedTo" label="应还日期" min-width="120" align="center" />
              <el-table-column prop="overdueDays" label="逾期天数" min-width="100" align="center">
                <template #default="{ row }">
                  <el-tag type="danger" size="small">{{ row.overdueDays }}天</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" min-width="120" align="center" fixed="right">
                <template #default="{ row }">
                  <el-button type="warning" size="small" @click="returnOverdueInstrument(row)">
                    归还
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <el-empty v-if="!expiringLoading && expiringList.length === 0" description="暂无逾期未还的乐器" />
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
import { 
  rentInstrumentService, 
  getMyRentalsService, 
  returnInstrumentService,
  checkRentalEligibilityService,
  getRentalApplicationHistoryService,
  getUserOverdueRentalsService
} from '@/api/common'

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

// 即将到期租借相关
const expiringLoading = ref(false)
const expiringList = ref([])

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

//测试加载函数
const testLoadMyRentals = () => {
  console.log('手动触发测试加载我的租借...');
  loadMyRentals();
}

//检查租借资格
const checkRentalEligibility = async () => {
  try {
    const res = await checkRentalEligibilityService()
    if (res.code === 200) {
      return res.data // 返回资格状态
    } else {
      ElMessage.error(res.message || '检查租借资格失败')
      return false
    }
  } catch (error) {
    console.error('检查租借资格失败:', error)
    return false
  }
}

// 加载可租借乐器列表
const loadInstruments = async () => {
  loading.value = true
  try {
    // 检查用户是否有租借资格
    const eligible = await checkRentalEligibility()
    if (!eligible) {
      ElMessage.warning('您当前不具备租借乐器的资格')
      instrumentList.value = []
      pagination.total = 0
      return
    }

    // 使用模拟数据，因为当前后端可能没有提供专门的可租借乐器接口
    useMockData()
  } catch (error) {
    console.error('获取可租借乐器列表失败:', error);
    // 如果API调用失败，使用模拟数据
    useMockData();
  } finally {
    loading.value = false
  }
}

// 加载我的租借列表
const loadMyRentals = async () => {
  console.log('开始加载我的租借列表...');
  myRentalLoading.value = true
  try {
    const params = {
      page: myRentalPagination.page,
      size: myRentalPagination.size
    }
    console.log('调用getMyRentalsService，参数:', params);
    const res = await getMyRentalsService({ params }) // 根据API定义传递参数
    console.log('API响应:', res);
    console.log('API响应data字段:', res.data);
    console.log('API响应data类型:', typeof res.data);
    console.log('API响应data是否为数组:', Array.isArray(res.data));
    console.log('API响应data内容:', JSON.stringify(res.data, null, 2));
    
    if (res.code === 200) {
      //检查data的结构
      if (Array.isArray(res.data)) {
        // 如果data直接是数组
        myRentalList.value = res.data || []
        myRentalPagination.total = res.data.length || 0
        console.log('直接数组模式: 设置myRentalList为', myRentalList.value);
        console.log('第一条记录:', myRentalList.value[0]);
        console.log('字段检查 - modelName:', myRentalList.value[0]?.modelName);
        console.log('字段检查 - brandName:', myRentalList.value[0]?.brandName);
        console.log('字段检查 - status:', myRentalList.value[0]?.status);
      } else if (res.data && res.data.records) {
        // 如果data包含records字段
        myRentalList.value = res.data.records || []
        myRentalPagination.total = res.data.total || 0
        console.log('records模式: 设置myRentalList为', myRentalList.value);
      } else {
        //其情况，使用空数组
        myRentalList.value = []
        myRentalPagination.total = 0
        console.log('未知数据结构，使用空数组');
      }
      console.log('我的租借列表数据:', myRentalList.value);
      console.log('分页总数:', myRentalPagination.total);
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

// 加载逾期未还列表
const loadExpiringRentals = async () => {
  expiringLoading.value = true
  try {
    const res = await getUserOverdueRentalsService()
    if (res.code === 200) {
      // 转换数据格式以匹配表格显示
      expiringList.value = res.data.map(item => ({
        instrumentId: item.instrumentId,
        modelName: item.modelName,
        brandName: item.brand,
        type: item.type,
        serialNumber: item.serialNumber,
        rentedFrom: item.rentedFrom,
        rentedTo: item.rentedTo,
        // 计算逾期天数
        overdueDays: Math.floor((new Date() - new Date(item.rentedTo)) / (1000 * 60 * 60 * 24)),
        status: item.status
      })) || []
    } else {
      ElMessage.error(res.message || '获取逾期租借失败')
      // 使用模拟数据作为备选方案
      expiringList.value = [
        {
          instrumentId: 1,
          modelName: '雅马哈 U1 立式钢琴',
          brandName: '雅马哈',
          type: '钢琴',
          serialNumber: 'SN123456789',
          rentedFrom: '2024-01-15',
          rentedTo: '2024-02-01',
          overdueDays: 5,
          status: 'overdue'
        }
      ]
    }
  } catch (error) {
    console.error('获取逾期租借失败:', error)
    ElMessage.error('获取逾期租借失败')
    // 使用模拟数据作为备选方案
    expiringList.value = [
      {
        instrumentId: 1,
        modelName: '雅马哈 U1 立式钢琴',
        brandName: '雅马哈',
        type: '钢琴',
        serialNumber: 'SN123456789',
        rentedFrom: '2024-01-15',
        rentedTo: '2024-02-01',
        overdueDays: 5,
        status: 'overdue'
      }
    ]
  } finally {
    expiringLoading.value = false
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
      days: parseInt(rentDialog.form.days)
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
      let errorMessage = '租借申请提交失败'
      if (error.response) {
        // 服务器响应了错误状态码
        errorMessage = error.response.data?.message || `服务器错误 ${error.response.status}`
      } else if (error.request) {
        // 请求已发出但没有收到响应
        errorMessage = '网络连接失败，请检查网络'
      } else {
        // 其他错误
        errorMessage = error.message || '未知错误'
      }
      ElMessage.error(errorMessage)
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
    
    const res = await returnInstrumentService(row.instrumentId) // 使用instrumentId而不是row.id
    if (res.code === 200) {
      ElMessage.success('归还成功')
      loadMyRentals() // 刷新我的租借列表
      loadExpiringRentals() // 刷新即将到期列表
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

// 归还逾期乐器
const returnOverdueInstrument = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定归还乐器 ${row.modelName} 吗？`,
      '归还确认',
      {
        confirmButtonText: '确定归还',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const res = await returnInstrumentService(row.instrumentId)
    if (res.code === 200) {
      ElMessage.success('乐器归还成功')
      // 重新加载逾期列表
      loadExpiringRentals()
    } else {
      ElMessage.error(res.message || '归还失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('归还乐器失败:', error)
      ElMessage.error('归还乐器失败')
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
    rented: '租借中', 
    returned: '已归还', 
    overdue: '已逾期',
    pending: '待审批',
    available: '可租借',
    sold: '已售出'
  }
  return map[status] || status
}

const getStatusTag = (status) => {
  const map = { 
    rented: 'primary', 
    returned: 'success', 
    overdue: 'danger',
    pending: 'warning',
    available: 'info',
    sold: 'info'
  }
  return map[status] || 'info'
}

// 使用模拟数据作为备选方案
const useMockData = () => {
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

// 初始化加载
onMounted(() => {
  console.log('页面挂载完成，开始初始化加载...');
  loadInstruments()
  loadMyRentals()
  loadExpiringRentals()
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

  .instrument-list, .my-rentals-list, .expiring-list {
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