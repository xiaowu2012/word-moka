# 单词魔卡 🧚

初中英语课本同步单词学习小程序。

## 首次使用 Setup

### 1. 导入项目

打开 **微信开发者工具** → 项目 → 导入：
- 项目目录：`word-moka/miniprogram`
- AppID：`wxc956a3d71abc8412`
- 后端服务：**微信云开发**

### 2. 创建数据库集合

云开发控制台 → 数据库 → 创建集合：
- 集合名：`user_progress`
- 权限设置：所有用户可读，仅创建者可写

### 3. 部署云函数

云开发控制台 → 云函数 → 右键：
- `getProgress` → 上传并部署（云端安装依赖）
- `updateProgress` → 上传并部署（云端安装依赖）

### 4. 预览

开发者工具 → 预览 → 手机扫码

## 项目结构

```
miniprogram/
├── app.js              # 应用入口 + 全局数据
├── app.json            # 应用配置
├── app.wxss            # 全局样式
├── data/
│   └── words.json      # 单词数据（外研版八下 10词）
├── audio/              # 30个音频文件（10词×3段）
├── images/
│   └── logo.jpg        # Logo
└── pages/
    ├── index/          # 首页（教材选择）
    ├── wordlist/       # 单词列表
    ├── detail/         # 单词卡片详情（发音/收藏/掌握）
    └── review/         # 复习模式

cloudfunctions/
├── getProgress/        # 获取学习进度
└── updateProgress/     # 更新学习进度（收藏/掌握）
```

## 后续扩展

- [ ] 补全外研版八下剩余77词音频
- [ ] 上线人教版八下
- [ ] 加入艾宾浩斯复习提醒
- [ ] 学习数据统计看板
