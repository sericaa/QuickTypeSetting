const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const htmlToDocx = require('html-to-docx');
const mammoth = require('mammoth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// 中间件
app.use(cors({
  origin: '*', // 允许所有来源
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'multipart/form-data']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, 'client/build')));

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 检查DeepSeek API密钥
if (!process.env.DEEPSEEK_API_KEY) {
  console.warn('警告: 未设置DEEPSEEK_API_KEY环境变量。请创建.env文件并添加您的API密钥。');
}

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '快速排版服务运行正常' });
});

// 上传文本文件并获取排版意图
app.post('/api/upload', upload.single('textFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传文本文件' });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const typesettingIntent = req.body.intent || '标准排版，包括标题、段落、列表等基本格式';
    
    // 定义文本文件类型
    const textFileExtensions = ['.txt', '.md', '.html', '.htm'];
    // 定义Office文档类型
    const docxFileExtensions = ['.docx', '.doc'];
    let textPreview;
    let extractedText;
    
    if (textFileExtensions.includes(fileExtension)) {
      // 对于文本文件，尝试以UTF-8读取内容
      try {
        const textContent = await fs.readFile(filePath, 'utf-8');
        textPreview = textContent.substring(0, 500) + (textContent.length > 500 ? '...' : '');
        extractedText = textContent;
      } catch (e) {
        // 如果UTF-8读取失败，提供替代预览
        textPreview = `[二进制文件内容无法直接预览，请确保文件编码为UTF-8]`;
        extractedText = '';
      }
    } else if (docxFileExtensions.includes(fileExtension)) {
      // 对于docx/doc文件，使用mammoth提取文本内容
      try {
        const buffer = await fs.readFile(filePath);
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
        textPreview = extractedText.substring(0, 500) + (extractedText.length > 500 ? '...' : '');
      } catch (e) {
        console.error('docx解析错误:', e);
        textPreview = `[${req.file.originalname} - 文档解析失败，请确保文件格式正确]`;
        extractedText = '';
      }
    } else {
      // 对于其他二进制文件，不尝试读取内容
      textPreview = `[${req.file.originalname} - 二进制文件，内容无法直接预览]`;
      extractedText = '';
    }

    res.json({
      success: true,
      message: '文件上传成功',
      filename: req.file.filename,
      textPreview: textPreview,
      extractedText: extractedText, // 添加提取的完整文本内容
      intent: typesettingIntent
    });
  } catch (error) {
    console.error('上传错误:', error);
    res.status(500).json({ error: '文件上传失败', details: error.message });
  }
});

// 调用DeepSeek API进行排版
app.post('/api/typeset', async (req, res) => {
  try {
    const { text, extractedText, intent, filename } = req.body;

    // 优先使用extractedText（可能来自docx解析），如果没有则使用text（预览文本）
    const contentToTypeset = extractedText || text;
    
    if (!contentToTypeset || !intent) {
      return res.status(400).json({ error: '缺少文本内容或排版意图' });
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return res.status(500).json({ 
        error: '服务器配置错误', 
        message: '未配置DeepSeek API密钥。请在.env文件中设置DEEPSEEK_API_KEY。'
      });
    }

    // 构建DeepSeek API请求
    const prompt = `请将以下文本按照要求进行排版，返回完整的HTML代码（只返回HTML，不要有其他说明）：

排版要求：${intent}

待排版文本：
${contentToTypeset}

请生成美观、专业的HTML排版代码，包括适当的CSS样式。`;

    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的HTML排版专家，擅长将纯文本转换为美观的HTML文档。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const htmlContent = response.data.choices[0].message.content;
    
    // 清理HTML内容（移除可能的代码块标记）
    let cleanHtml = htmlContent
      .replace(/```html\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // 确保HTML有基本结构
    if (!cleanHtml.includes('<html>')) {
      cleanHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>排版结果 - ${filename || '文档'}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; }
        p { margin-bottom: 15px; }
        ul, ol { margin-left: 20px; margin-bottom: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 30px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #7f8c8d; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>排版结果</h1>
        <p>生成时间: ${new Date().toLocaleString('zh-CN')}</p>
    </div>
    ${cleanHtml}
    <div class="footer">
        <p>由快速排版系统生成</p>
    </div>
</body>
</html>`;
    }

    // 保存HTML文件
    const htmlFilename = `typeset-${Date.now()}.html`;
    const htmlPath = path.join('uploads', htmlFilename);
    await fs.writeFile(htmlPath, cleanHtml, 'utf-8');

    res.json({
      success: true,
      message: '排版完成',
      html: cleanHtml,
      htmlUrl: `/uploads/${htmlFilename}`,
      filename: htmlFilename
    });

  } catch (error) {
    console.error('DeepSeek API错误:', error.response?.data || error.message);
    res.status(500).json({ 
      error: '排版失败', 
      details: error.response?.data?.error?.message || error.message,
      suggestion: '请检查API密钥是否正确，或稍后重试。'
    });
  }
});

// 将HTML转换为Word文档
app.post('/api/convert-to-word', async (req, res) => {
  try {
    const { html, filename } = req.body;

    if (!html) {
      return res.status(400).json({ error: '缺少HTML内容' });
    }

    // 转换HTML为Word文档
    const fileBuffer = await htmlToDocx(html, null, {
      title: filename || '排版文档',
      subject: '快速排版系统生成的文档',
      creator: '快速排版系统',
      keywords: ['排版', '文档', '转换'],
      description: '通过DeepSeek API生成的排版文档'
    });

    const wordFilename = `document-${Date.now()}.docx`;
    const wordPath = path.join('uploads', wordFilename);
    await fs.writeFile(wordPath, fileBuffer);

    res.json({
      success: true,
      message: 'Word文档生成成功',
      downloadUrl: `/uploads/${wordFilename}`,
      filename: wordFilename
    });

  } catch (error) {
    console.error('Word转换错误:', error);
    res.status(500).json({ error: 'Word文档生成失败', details: error.message });
  }
});

// 处理React路由 - 所有未匹配的API请求返回前端应用
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API端点不存在' });
  }
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📁 上传目录: ${path.join(__dirname, 'uploads')}`);
  console.log('🔑 请确保已设置DEEPSEEK_API_KEY环境变量');
});