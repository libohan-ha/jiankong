# 电动汽车充电安全监控系统前端

这是电动汽车充电安全监控系统的前端部分，基于 React 和 Ant Design 开发。

## 功能特点

- 实时监控电动汽车充电过程中的安全状况
- 摄像头监控管理，支持实时视频流查看和 AI 检测
- 传感器数据监控，包括温度、电流、电压等关键参数
- 报警管理系统，支持多级别报警和处理流程
- 系统设置，包括通知、安全、API 和备份等配置

## 技术栈

- React 18
- React Router 6
- Ant Design 4
- Chart.js
- Axios

## 安装与运行

### 前提条件

- Node.js 14.0+
- npm 6.0+

### 安装步骤

1. 克隆仓库

```bash
git clone <repository-url>
cd electric_vehicle_monitoring/frontend
```

2. 安装依赖

```bash
npm install
```

3. 启动开发服务器

```bash
npm start
```

应用将在 [http://localhost:3000](http://localhost:3000) 运行。

### 生产环境构建

```bash
npm run build
```

构建文件将生成在 `build` 目录中。

## 项目结构

```
src/
  ├── components/       # 可复用组件
  │   ├── AppHeader.js  # 应用头部组件
  │   └── AppSidebar.js # 应用侧边栏组件
  ├── pages/            # 页面组件
  │   ├── Dashboard.js  # 仪表盘页面
  │   ├── Cameras.js    # 摄像头监控页面
  │   ├── Sensors.js    # 传感器数据页面
  │   ├── Alerts.js     # 报警管理页面
  │   └── Settings.js   # 系统设置页面
  ├── App.js            # 应用主组件
  ├── App.css           # 应用样式
  ├── index.js          # 入口文件
  └── index.css         # 全局样式
```

## 后端 API 集成

前端通过 Axios 与后端 API 进行通信。API 基础 URL 配置在`package.json`的`proxy`字段中，默认为`http://localhost:8000`。

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

[MIT](LICENSE)
