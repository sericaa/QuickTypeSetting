# 快速排版系统 (Quick Type Setting)

一个基于Node.js的前后端Web应用，通过DeepSeek API实现智能文本排版，并支持Word文档解析和转换。

## 功能特性

- 上传未排版的纯文本文件
- 支持Word文档(.docx)上传并自动提取文本
- 指定排版意图和要求
- 调用DeepSeek API生成专业HTML排版
- 实时预览排版结果
- 一键下载为Word文档
- 响应式现代UI设计

## 技术栈

### 后端
- Node.js + Express
- DeepSeek API 
- Multer 
- html-to-docx
- mammoth

### 前端
- React.js
- Axios 
- Ant Design 
- React Router 

## 快速开始

### 1. 环境准备

确保已安装：
- Node.js (>=16.0.0)
- npm 或 yarn

### 2. 获取DeepSeek API密钥

1. 访问 [DeepSeek平台](https://platform.deepseek.com/)
2. 注册/登录账号
3. 在API密钥页面创建新密钥
4. 复制您的API密钥

### 3. 项目安装

```bash
# 克隆项目
git clone https://github.com/sericaa/QuickTypeSetting.git
cd QuickTypeSetting

# 安装后端依赖
npm install

# 安装前端依赖
cd client
npm install
cd ..

# 配置环境变量
# 创建.env文件并填入您的DeepSeek API密钥
```

### 4. 启动应用

```bash
# 启动后端服务器
npm run dev

# 在另一个终端启动前端服务器
cd client
npm start
```

后端将在 http://localhost:5001 启动，前端将在 http://localhost:3000 启动

## 使用指南

### 步骤1: 上传文本
1. 点击"上传文本文件"按钮
2. 选择您的.txt、.md或.docx文件
3. 文件大小限制：10MB
4. **对于.docx文件，系统会自动提取文本内容**

### 步骤2: 指定排版意图
在文本框中描述您的排版要求，例如：
- "标准排版，包含标题、段落、列表"
- "学术论文格式，包含摘要、章节、参考文献"
- "商业报告格式，包含封面、目录、页眉页脚"

### 步骤3: 生成排版
点击"开始排版"按钮，系统将：
1. 调用DeepSeek API分析文本和意图
2. 生成专业的HTML排版代码
3. 在页面中显示实时预览

### 步骤4: 下载文档
在预览满意后，点击"下载Word文档"按钮，系统将：
1. 将HTML转换为.docx格式
2. 自动开始下载

## API端点

### 健康检查
```
GET /api/health
```

### 文件上传
```
POST /api/upload
Content-Type: multipart/form-data

参数:
- textFile: 文本或Word文件
- intent: 排版意图 (可选)
```

### 排版生成
```
POST /api/typeset
Content-Type: application/json

参数:
- text: 文本内容
- intent: 排版意图
- filename: 原始文件名 (可选)
- extractedText: 从Word文档提取的文本 (内部使用)
```

### Word转换
```
POST /api/convert-to-word
Content-Type: application/json

参数:
- html: HTML内容
- filename: 文件名 (可选)
```

## 项目结构

```
QuickTypeSetting/
├── server.js              # 后端主文件
├── package.json          # 项目配置
├── .env                  # 环境变量配置
├── uploads/              # 文件上传目录
└── client/               # React前端应用
    ├── public/
    ├── src/
    │   ├── App.css       # 样式文件
    │   ├── App.js        # 主应用组件
    │   └── index.js      # 入口文件
    └── package.json
```

## 配置说明

### 环境变量 (.env)

```env
# 必填: DeepSeek API密钥
DEEPSEEK_API_KEY=sk-your-api-key-here
```

## 故障排除

### 常见问题

1. **API密钥错误**
   - 检查.env文件中的DEEPSEEK_API_KEY是否正确
   - 确保API密钥有足够的余额

2. **文件上传失败**
   - 检查文件大小是否超过限制
   - 确保uploads目录有写入权限

3. **Word文档解析问题**
   - 系统目前仅支持.docx格式，不支持.doc格式
   - 复杂格式的Word文档可能无法完全解析

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！

---

**提示**: 使用前请确保已获取有效的DeepSeek API密钥。

项目地址：[github.com/sericaa/QuickTypeSetting](https://github.com/sericaa/QuickTypeSetting)