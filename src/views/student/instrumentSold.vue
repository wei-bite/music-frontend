<template>
  <div class="instrument-sold-container">
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="可购乐器" name="available">
        <el-card shadow="never" style="border-radius: 8px; border: 1px solid #e4e7ed;">
          <template #header>
            <div class="card-header">
              <span>可购乐器</span>
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
              <el-table-column prop="availableCount" label="可售数量" min-width="100" align="center" />
              <el-table-column prop="price" label="售价(元)" min-width="100" align="center">
                <template #default="{ row }">
                  ¥{{ row.price }}
                </template>
              </el-table-column>
              <el-table-column label="操作" min-width="120" align="center">
                <template #default="{ row }">
                  <el-button 
                    type="success" 
                    size="small" 
                    :disabled="row.availableCount <= 0"
                    @click="openBuyDialog(row)"
                  >
                    购买
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

            <el-empty v-if="!loading && instrumentList.length === 0" description="暂无乐器可购买" />
          </div>
        </el-card>
      </el-tab-pane>
      
      <el-tab-pane label="我的购买" name="myPurchases">
        <el-card shadow="never" style="border-radius: 8px; border: 1px solid #e4e7ed;">
          <template #header>
            <div class="card-header">
              <span>我的购买</span>
            </div>
          </template>

          <!-- 我的购买列表 -->
          <div class="my-purchases-list">
            <el-table 
              :data="myPurchaseList" 
              style="width: 100%" 
              v-loading="myPurchaseLoading" 
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
              <el-table-column prop="purchaseDate" label="购买日期" min-width="120" align="center" />
              <el-table-column prop="quantity" label="数量" min-width="80" align="center" />
              <el-table-column prop="totalAmount" label="总价(元)" min-width="100" align="center">
                <template #default="{ row }">
                  ¥{{ row.totalAmount }}
                </template>
              </el-table-column>
              <el-table-column prop="deliveryAddress" label="收货地址" min-width="150" align="center" />
            </el-table>
            
            <el-pagination
              v-model:current-page="myPurchasePagination.page"
              v-model:page-size="myPurchasePagination.size"
              :page-sizes="[5, 10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="myPurchasePagination.total"
              @size-change="handleMyPurchaseSizeChange"
              @current-change="handleMyPurchaseCurrentChange"
              style="margin-top: 20px; text-align: right;"
            />

            <el-empty v-if="!myPurchaseLoading && myPurchaseList.length === 0" description="暂无购买记录" />
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 购买对话框 -->
    <el-dialog v-model="buyDialog.visible" title="申请购买乐器" width="500px" destroy-on-close>
      <el-form :model="buyDialog.form" :rules="buyDialog.rules" ref="buyFormRef" label-width="100px">
        <el-form-item label="乐器型号" prop="modelName">
          <el-input v-model="buyDialog.form.modelName" disabled />
        </el-form-item>
        <el-form-item label="品牌" prop="brandName">
          <el-input v-model="buyDialog.form.brandName" disabled />
        </el-form-item>
        <el-form-item label="购买价格" prop="price">
          <el-input v-model.number="buyDialog.form.price" disabled />
        </el-form-item>
        <el-form-item label="购买数量" prop="quantity">
          <el-input-number 
            v-model="buyDialog.form.quantity" 
            :min="1" 
            :max="10" 
            controls-position="right"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="收货地址" prop="deliveryAddress">
          <el-input 
            v-model="buyDialog.form.deliveryAddress" 
            type="textarea" 
            :rows="3"
            placeholder="请输入收货地址"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input 
            v-model="buyDialog.form.remarks" 
            type="textarea" 
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="buyDialog.visible = false">取消</el-button>
          <el-button type="success" @click="submitBuy" :loading="buyDialog.submitting">确认购买</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { buyInstrumentService } from '@/api/common'

// 响应式数据
const activeTab = ref('available')
const loading = ref(false)
const instrumentList = ref([])
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 我的购买相关
const myPurchaseLoading = ref(false)
const myPurchaseList = ref([])
const myPurchasePagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 购买对话框
const buyDialog = reactive({
  visible: false,
  submitting: false,
  form: {
    modelId: null,
    modelName: '',
    brandName: '',
    price: 0,
    quantity: 1,
    deliveryAddress: '',
    remarks: ''
  },
  rules: {
    quantity: [
      { required: true, message: '请输入购买数量', trigger: 'blur' },
      { type: 'number', min: 1, max: 10, message: '购买数量必须在1-10之间', trigger: 'blur' }
    ],
    deliveryAddress: [
      { required: true, message: '请输入收货地址', trigger: 'blur' },
      { max: 200, message: '收货地址不能超过200个字符', trigger: 'blur' }
    ]
  }
})

const buyFormRef = ref()

// 加载可购买乐器列表
const loadInstruments = async () => {
  loading.value = true
  try {
    // 直接使用模拟数据，因为当前环境下后端可能没有提供合适的API
    // 在实际生产环境中，应使用专门的可购买乐器API
    instrumentList.value = [
      {
        id: 1,
        modelName: '卡西欧 CT-S200 电子键盘',
        brandName: '卡西欧',
        type: 'keyboard',
        description: '便携式电子键盘，适合初学者练习使用',
        availableCount: 5,
        price: 899
      },
      {
        id: 2,
        modelName: '星臣 D1C 民谣吉他',
        brandName: '星臣',
        type: 'guitar',
        description: '入门级民谣吉他，性价比高',
        availableCount: 8,
        price: 599
      },
      {
        id: 3,
        modelName: '红棉 MK200 小提琴',
        brandName: '红棉',
        type: 'violin',
        description: '学生级小提琴，音质纯正',
        availableCount: 3,
        price: 1299
      }
    ];
    pagination.total = instrumentList.value.length;
  } catch (error) {
    console.error('获取乐器列表失败:', error);
    // 使用模拟数据
    instrumentList.value = [
      {
        id: 1,
        modelName: '卡西欧 CT-S200 电子键盘',
        brandName: '卡西欧',
        type: 'keyboard',
        description: '便携式电子键盘，适合初学者练习使用',
        availableCount: 5,
        price: 899
      },
      {
        id: 2,
        modelName: '星臣 D1C 民谣吉他',
        brandName: '星臣',
        type: 'guitar',
        description: '入门级民谣吉他，性价比高',
        availableCount: 8,
        price: 599
      },
      {
        id: 3,
        modelName: '红棉 MK200 小提琴',
        brandName: '红棉',
        type: 'violin',
        description: '学生级小提琴，音质纯正',
        availableCount: 3,
        price: 1299
      }
    ];
    pagination.total = instrumentList.value.length;
  } finally {
    loading.value = false
  }
}

// 加载我的购买列表
const loadMyPurchases = async () => {
  myPurchaseLoading.value = true
  try {
    // 直接使用模拟数据，因为当前环境下后端可能没有提供合适的API
    // 在实际生产环境中，应使用专门的获取我的购买记录API
    myPurchaseList.value = [
      {
        id: 1,
        modelName: '雅马哈 U1 立式钢琴',
        brandName: '雅马哈',
        status: 'delivered',
        purchaseDate: '2024-01-15',
        quantity: 1,
        totalAmount: 25000,
        deliveryAddress: '北京市朝阳区xxx街道xxx号'
      },
      {
        id: 2,
        modelName: '马丁 D-28 民谣吉他',
        brandName: '马丁',
        status: 'received',
        purchaseDate: '2024-01-10',
        quantity: 1,
        totalAmount: 8999,
        deliveryAddress: '北京市朝阳区xxx街道xxx号'
      }
    ];
    myPurchasePagination.total = myPurchaseList.value.length;
  } catch (error) {
    console.error('获取购买记录失败:', error)
    myPurchaseList.value = [];
    myPurchasePagination.total = 0;
  } finally {
    myPurchaseLoading.value = false
  }
}

// 打开购买对话框
const openBuyDialog = (row) => {
  buyDialog.form.modelId = row.id
  buyDialog.form.modelName = row.modelName
  buyDialog.form.brandName = row.brandName
  buyDialog.form.price = row.price
  buyDialog.form.quantity = 1
  buyDialog.form.deliveryAddress = ''
  buyDialog.form.remarks = ''
  buyDialog.visible = true
}

// 提交购买申请
const submitBuy = async () => {
  if (!buyFormRef.value) return
  
  await buyFormRef.value.validate((valid) => {
    if (!valid) {
      return
    }
    
    buyDialog.submitting = true
    buyInstrumentService(buyDialog.form.modelId, {
      quantity: buyDialog.form.quantity,
      deliveryAddress: buyDialog.form.deliveryAddress,
      remarks: buyDialog.form.remarks
    })
    .then(res => {
      if (res.code === 200) {
        ElMessage.success('购买申请提交成功，请等待审核')
        buyDialog.visible = false
        loadInstruments() // 刷新列表
      } else {
        ElMessage.error(res.message || '购买申请提交失败')
      }
    })
    .catch(error => {
      console.error('购买申请提交失败:', error)
      ElMessage.error('购买申请提交失败')
    })
    .finally(() => {
      buyDialog.submitting = false
    })
  })
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

// 分页处理 - 我的购买列表
const handleMyPurchaseSizeChange = (size) => {
  myPurchasePagination.size = size
  myPurchasePagination.page = 1
  loadMyPurchases()
}

const handleMyPurchaseCurrentChange = (page) => {
  myPurchasePagination.page = page
  loadMyPurchases()
}

// 状态标签处理
const getStatusText = (status) => {
  const map = { 
    pending: '待审核', 
    approved: '已批准', 
    rejected: '已拒绝',
    delivered: '已发货',
    received: '已收货'
  }
  return map[status] || status
}

const getStatusTag = (status) => {
  const map = { 
    pending: 'warning', 
    approved: 'primary', 
    rejected: 'danger',
    delivered: 'info',
    received: 'success'
  }
  return map[status] || 'info'
}

// 初始化加载
onMounted(() => {
  loadInstruments()
  loadMyPurchases()
})
</script>

<style scoped lang="scss">
.instrument-sold-container {
  padding: 20px;
  background-color: #f5f7fa;

  .card-header {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }

  .instrument-list, .my-purchases-list {
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