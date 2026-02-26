<!-- src/components/GenericListManager.vue -->
<script setup>
import { defineProps, defineEmits } from 'vue'
import { View,Edit,Delete } from "@element-plus/icons-vue";

const props = defineProps({
  title: { type: String, default: '管理' },
  columns: { type: Array, required: true },
  searchFields: { type: Array, default: () => [] },
  list: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
  pagination: { type: Object, required: true },
  searchParams: { type: Object, default: () => ({}) },
  showViewBtn: { type: Boolean, default: false } // 控制是否显示“查看”按钮
})

const emit = defineEmits([
  'search',
  'reset',
  'page-change',
  'size-change',
  'create',
  'edit',
  'delete',
  'view-detail'
])

const handleCreate = () => emit('create')
const handleEdit = (row) => emit('edit', row)
const handleDelete = (id) => emit('delete', id)
const handleView = (id) => emit('view-detail', id)

const onSearch = () => emit('search')
const onReset = () => emit('reset')
const onPageChange = (page) => emit('page-change', page)
const onSizeChange = (size) => emit('size-change', size)
</script>

<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>{{ title }}</span>
        <el-button type="primary" @click="handleCreate">新增</el-button>
      </div>
    </template>

    <!-- 搜索区 -->
    <el-form v-if="searchFields.length > 0" inline>
      <el-form-item
        v-for="field in searchFields"
        :key="field.prop"
        :label="field.label"
      >
        <el-input
          v-if="field.type === 'input'"
          v-model.trim="searchParams[field.prop]"
          :placeholder="field.placeholder || '请输入'"
          clearable
          @keyup.enter="onSearch"
          style="width: 180px"
        />
        <el-select
          v-else-if="field.type === 'select'"
          v-model="searchParams[field.prop]"
          clearable
          :placeholder="field.placeholder || '请选择'"
          style="width: 140px"
        >
          <el-option
            v-for="opt in field.options"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">查询</el-button>
        <el-button @click="onReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <el-table v-loading="loading" :data="list" style="width: 100%">
      <el-table-column
        v-for="col in columns"
        :key="col.prop"
        :prop="col.prop"
        :label="col.label"
        :width="col.width"
        :min-width="col.minWidth || '120'"
      >
        <template #default="{ row }">
          <slot :name="`col-${col.prop}`" :row="row">
            {{ row[col.prop] }}
          </slot>
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <!-- ✅ 查看按钮 -->
          <el-button
            v-if="showViewBtn"
            type="info"
            size="small"
            @click="() => handleView(row.id)"
          >
            <el-icon><View /></el-icon>
          </el-button>
          <el-button type="primary" size="small" @click="() => handleEdit(row)">
            <el-icon><Edit /></el-icon>
          </el-button>
          <el-button type="danger" size="small" @click="() => handleDelete(row.id)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </template>
      </el-table-column>

      <template #empty>
        <el-empty description="暂无数据" />
      </template>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-if="total > 0"
      :total="total"
      :current-page="pagination.page"
      :page-size="pagination.size"
      layout="total, sizes, prev, pager, next, jumper"
      @current-change="onPageChange"
      @size-change="onSizeChange"
      style="margin-top: 16px; display: flex; justify-content: center"
    />
  </el-card>
</template>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>