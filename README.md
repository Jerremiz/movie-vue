# 📋 项目简介

一个使用 Vue3 构建的现代电影信息浏览和收藏 Web 应用。

## ✨ 功能特性

- 🎬 浏览热门电影（日榜/周榜）
- ⭐ 个人影单收藏功能（添加、删除、查询）
- 💬 电影评论系统（添加、删除、查询）
- 👤 用户注册、登录和个人资料管理
- 📱 响应式设计，支持移动设备

## ⚙️ 技术栈

- **前端框架**: Vue3
- **构建工具**: Vite
- **UI组件**: Element Plus
- **状态管理**: Pinia
- **HTTP客户端**: Axios
- **测试工具**: Vitest

## 🔧 安装

### 环境要求

- Node.js
- yarn

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/Jerremiz/movie-vue.git
cd movie-vue
```

2. 安装依赖
```bash
yarn install
```

3. 启动开发服务器
```bash
yarn dev
```

4. 构建
```bash
yarn build
```

## 📝 API说明

本项目使用`https://mondaydb.top`作为后端API，主要功能包括：

- `/` - 首页
- `/login` - 登录页面
- `/register` - 注册页面
- `/trending/week` - 本周热门电影
- `/trending/day` - 今日热门电影
- `/movie/:id` - 电影详情页
- `/movie-list` - 我的影单
- `/profile` - 个人资料
- `/search` - 电影搜索

## 📄 许可证

- [GNU General Public License v3.0](LICENSE)