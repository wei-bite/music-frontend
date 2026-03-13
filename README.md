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

## 📁 项目结构

```
src/
├── api/                  # API 接口定义
│   ├── admin/           # 管理员相关接口
│   ├── student/         # 学生相关接口
│   ├── teacher/         # 教师相关接口
│   └── user/            # 用户相关接口
├── assets/              # 静态资源
├── components/          # 公共组件
├── router/              # 路由配置
├── stores/              # 状态管理
├── utils/               # 工具函数
├── views/               # 页面组件
│   ├── admin/          # 管理员页面
│   ├── student/        # 学生页面
│   └── teacher/        # 教师页面
├── App.vue             # 根组件
└── main.js             # 入口文件
```

## 🎯 核心功能

### 👤 管理员端

- **用户管理**: 学生、教师信息管理，密码重置
- **课程管理**: 课程创建、编辑、删除、恢复
- **乐器管理**: 乐器库存、租借管理、销售管理
- **预约管理**: 教室预约审核、乐器预约审核
- **排课管理**: 课程安排、批量排课
- **财务管理**: 收支记录、工资发放、财务报表
- **公告管理**: 系统公告发布与维护
- **考勤管理**: 教师考勤统计

### 👨‍🏫 教师端

- **我的课程**: 查看个人课程表
- **考勤打卡**: 上课签到
- **成绩管理**: 学生成绩录入与查询
- **工资查询**: 个人工资明细
- **请假审批**: 审批学生请假申请
- **公告查看**: 系统通知接收

### 👨‍🎓 学生端

- **我的课程**: 查看个人课程安排
- **乐器租借**: 在线租借乐器、查看租借记录
- **教室预约**: 练习室预约
- **成绩查询**: 考试成绩查看
- **请假申请**: 在线提交请假申请
- **公告查看**: 系统通知接收

## 🔧 配置说明

### API 地址配置

修改 `src/utils/request.js` 中的 `baseURL`:

```javascript
// 开发环境
const baseURL = 'http://localhost:8080'

// 生产环境
const baseURL = 'https://your-backend-api.com'
```

### 代理配置

修改 `vite.config.js` 中的代理设置:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

## 📦 部署

### GitHub Pages 部署

项目已配置 GitHub Actions 自动部署工作流。

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. **自动部署**
   - 推送到 main 分支后，GitHub Actions 会自动触发构建
   - 访问 https://github.com/wei-bite/music-frontend/actions 查看进度

3. **访问部署后的网站**
   ```
   https://wei-bite.github.io/music-frontend/
   ```

### 其他平台部署

#### Vercel
```bash
pnpm install -g vercel
vercel
```

#### Netlify
```bash
pnpm build
netlify deploy --prod --dir=dist
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

## 🛠️ 开发规范

### 代码风格

- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 遵循 Vue 3 组合式 API 最佳实践

### Git 提交规范

```bash
# 新功能
git commit -m "feat: 添加 xxx 功能"

# 修复 bug
git commit -m "fix: 修复 xxx 问题"

# 文档更新
git commit -m "docs: 更新 xxx 文档"

# 代码重构
git commit -m "refactor: 重构 xxx 模块"

# 样式调整
git commit -m "style: 调整 xxx 样式"
```

## 📸 项目截图

### 管理员端
- 用户管理界面
- 课程管理界面
- 乐器管理界面
- 财务报表界面

### 教师端
- 我的课程表
- 考勤打卡
- 成绩管理

### 学生端
- 乐器租借
- 教室预约
- 成绩查询

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 📄 许可证

MIT License

## 👨‍💻 作者

- **Wei-Bite**

## 📮 联系方式

如有问题或建议，请通过以下方式联系：

- Email: [你的邮箱]
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
