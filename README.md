# 快速排版系统 (Quick Type Setting)

一个基于Node.js的前后端Web应用，通过DeepSeek API实现智能文本排版，并可将结果转换为Word文档。

## 功能特性

- 📝 上传未排版的纯文本文件
- 🎯 指定排版意图和要求
- 🤖 调用DeepSeek API生成专业HTML排版
- 📄 实时预览排版结果
- 📥 一键下载为Word文档
- 🎨 响应式现代UI设计

## 技术栈

### 后端
- Node.js + Express
- DeepSeek API (AI排版)
- Multer (文件上传)
- html-to-docx (HTML转Word)

### 前端
- React.js
- Axios (API调用)
- Ant Design (UI组件)
- React Router (路由)

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
git clone <repository-url>
cd QuickTypeSetting

# 安装依赖
npm run install-all

# 配置环境变量
cp .env.example .env
# 编辑.env文件，填入您的DeepSeek API密钥
```

### 4. 启动应用

```bash
# 开发模式 (前后端同时运行)
npm run dev

# 生产模式
npm start
```

应用将在 http://localhost:5000 启动

## 使用指南

### 步骤1: 上传文本
1. 点击"上传文本文件"按钮
2. 选择您的.txt或.md文件
3. 文件大小限制：10MB

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
- textFile: 文本文件
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
├── .env.example          # 环境变量示例
├── uploads/              # 文件上传目录
└── client/               # React前端应用
    ├── public/
    ├── src/
    │   ├── components/   # React组件
    │   ├── pages/        # 页面组件
    │   ├── services/     # API服务
    │   └── App.js        # 主应用组件
    └── package.json
```

## 配置说明

### 环境变量 (.env)

```env
# 必填: DeepSeek API密钥
DEEPSEEK_API_KEY=sk-your-api-key-here

# 可选: 服务器端口
PORT=5000

# 可选: 文件大小限制 (字节)
MAX_FILE_SIZE=10485760
```

### 自定义样式

如需修改生成的HTML样式，编辑 `server.js` 中的CSS部分。

## 故障排除

### 常见问题

1. **API密钥错误**
   - 检查.env文件中的DEEPSEEK_API_KEY是否正确
   - 确保API密钥有足够的余额

2. **文件上传失败**
   - 检查文件大小是否超过限制
   - 确保uploads目录有写入权限

3. **排版结果不理想**
   - 尝试更详细的排版意图描述
   - 检查原始文本格式是否清晰

### 日志查看

```bash
# 查看服务器日志
tail -f server.log

# 查看错误日志
cat error.log
```

## 开发指南

### 添加新功能

1. 在后端 `server.js` 中添加新的API端点
2. 在前端 `client/src/services/api.js` 中添加对应的API调用
3. 在 `client/src/components/` 中创建新的React组件

### 测试

```bash
# 运行后端测试
npm test

# 运行前端测试
cd client && npm test
```

## 部署

### 传统部署

```bash
# 构建前端
cd client && npm run build

# 启动生产服务器
npm start
```

### Docker部署

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN cd client && npm install && npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！

## 支持

如有问题，请：
1. 查看 [FAQ](#故障排除)
2. 提交 [Issue](https://github.com/your-repo/issues)
3. 联系维护者

---

**提示**: 使用前请确保已获取有效的DeepSeek API密钥。