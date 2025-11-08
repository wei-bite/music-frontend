<script setup>
import zhCn from 'element-plus/es/locale/lang/zh-cn'
</script>

<template>
    <div>
    <el-config-provider :locale="zhCn">
      <!-- 一级路由出口 -->
      <router-view></router-view>
    </el-config-provider>
  </div>
</template>

<style scoped></style>
