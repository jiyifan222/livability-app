# 🏠 居住体验报告 · Livability Report

AI驱动的居住体验分析工具，支持中英文双语。

## 部署步骤

### 第一步：注册 GitHub 账号
1. 去 https://github.com 注册账号（免费）

### 第二步：上传代码到 GitHub
1. 登录 GitHub 后点击右上角 "+" → "New repository"
2. 仓库名填：`livability-app`
3. 选 Public，点击 "Create repository"
4. 把这个文件夹里的所有文件上传上去

### 第三步：注册 Vercel 账号
1. 去 https://vercel.com
2. 点击 "Sign Up"
3. 选择 "Continue with GitHub"（用 GitHub 账号登录，最方便）

### 第四步：部署到 Vercel
1. 登录 Vercel 后点击 "Add New Project"
2. 选择你的 `livability-app` 仓库
3. 点击 "Deploy"

### 第五步：添加 API Key（重要！）
1. 部署完成后进入项目设置
2. 点击 "Settings" → "Environment Variables"
3. 添加一个变量：
   - Name: `ANTHROPIC_API_KEY`
   - Value: 你的 API key（sk-ant-...）
4. 点击 Save，然后重新部署（Deployments → Redeploy）

### 完成！
你会得到一个免费的网址，比如：`https://livability-app.vercel.app`

## 文件结构
```
livability-app/
├── api/
│   └── report.js      # 后端 API（API key 安全存放在这里）
├── public/
│   └── index.html     # 前端页面
├── vercel.json        # Vercel 配置
└── package.json       # 项目配置
```

## 费用
- Vercel 托管：免费
- Anthropic API：每次生成报告约 $0.001（不到一分钱）
