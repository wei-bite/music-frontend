# 音乐教培管理系统 - 前端

一个基于 Vue 3 + Vite + Element Plus 的音乐教培管理系统前端应用。

🌐 **在线演示**: https://wei-bite.github.io/music-frontend/

## 📋 项目简介

这是一个功能完善的音乐教培管理系统，支持三种角色（管理员、教师、学生）的完整工作流程。系统提供课程管理、乐器租借、预约管理、财务管理等核心功能。

> **⚠️ 重要说明**: 本项目仅为前端部分，**后端代码暂时不公开**。前端使用模拟数据进行演示，部分功能可能无法完全展示。
## ✨ 技术栈

- **框架**: Vue 3.5.22
- **构建工具**: Vite 7.1.11
- **UI 组件库**: Element Plus 2.11.7
- **状态管理**: Pinia 3.0.3
- **路由**: Vue Router 4.6.3
- **HTTP 请求**: Axios 1.13.2
- **图表**: ECharts 6.0.0
- **样式**: SCSS
- **包管理器**: pnpm

## 🚀 快速开始

### 环境要求

- Node.js: `^20.19.0` 或 `>=22.12.0`
- pnpm: 最新版本

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

启动后访问：http://localhost:5173

### 生产构建

```bash
pnpm build
```

### 本地预览

```bash
pnpm preview
```


## ⚠️ 注意事项

### 后端说明

**本项目后端代码暂时不公开**。当前前端版本使用模拟数据进行演示，部分功能可能无法完全展示。

如需完整功能体验，需要自行搭建后端服务或等待后端开源。

### 模拟数据

由于后端未公开，以下功能使用模拟数据：

- 用户登录认证
- 乐器租借流程
- 课程管理
- 财务数据
- 考勤记录

### API 接口文档

后端 API 接口文档将在后端开源后一并提供。主要接口包括：

- 用户认证 (`/api/auth/*`)
- 用户管理 (`/api/users/*`)
- 课程管理 (`/api/courses/*`)
- 乐器管理 (`/api/instruments/*`)
- 预约管理 (`/api/reservations/*`)
- 财务管理 (`/api/finance/*`)

## 📄 许可证

MIT License

## 👨‍💻 作者

- **Wei-Bite**

## 📮 联系方式

如有问题或建议，请通过以下方式联系：

- GitHub Issues: [提交 Issue](https://github.com/wei-bite/music-frontend/issues)

## 🙏 致谢

感谢以下优秀的开源项目：

- [Vue.js](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Element Plus](https://element-plus.org/)
- [Pinia](https://pinia.vuejs.org/)
- [ECharts](https://echarts.apache.org/)

---

**注意**: 本项目仅供学习交流使用，商业用途请自行评估风险。
