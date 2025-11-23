<script setup>
// defineProps 是 Vue 3 中用于定义组件 props 的编译器宏。
// 它是在 <script setup> 中声明 props 的主要方式。
defineProps({
    title: {
        required: true,
        type: String
    }
})
</script>
 
<template>
  <el-card class="page-container">
    <template #header>
      <span>{{ title }}</span>
      <div class="extra">
        <!-- 具名插槽 -->
        <slot name="extra"></slot>
      </div>
    </template>
    <!-- 插槽部分 -->
    <slot></slot>
  </el-card>
</template>


<style lang="scss" scoped>
.page-container {
  min-height: 100%;
  box-sizing: border-box;
  :deep(.el-card__header)  {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
