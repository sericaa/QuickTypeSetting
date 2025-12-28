import React, { useState } from 'react';
import {
  Layout,
  Upload,
  Button,
  Input,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Alert,
  Spin,
  Progress,
  message,
  Divider,
  Steps,
  Descriptions,
  Tag
} from 'antd';
import {
  UploadOutlined,
  FileTextOutlined,
  CodeOutlined,
  DownloadOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import axios from 'axios';
import './App.css';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Step } = Steps;

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [file, setFile] = useState(null);
  const [intent, setIntent] = useState('标准排版，包括标题、段落、列表等基本格式');
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [typesetResult, setTypesetResult] = useState(null);
  const [wordResult, setWordResult] = useState(null);
  const [htmlPreview, setHtmlPreview] = useState('');
  const [progress, setProgress] = useState(0);

  const steps = [
    {
      title: '上传文本',
      description: '选择您的文本文件',
      icon: <UploadOutlined />
    },
    {
      title: '设置意图',
      description: '描述排版要求',
      icon: <SettingOutlined />
    },
    {
      title: 'AI排版',
      description: '生成HTML代码',
      icon: <CodeOutlined />
    },
    {
      title: '下载文档',
      description: '获取Word文件',
      icon: <DownloadOutlined />
    }
  ];

  const handleFileUpload = async (file) => {
    setLoading(true);
    setProgress(20);
    
    const formData = new FormData();
    formData.append('textFile', file);
    formData.append('intent', intent);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setUploadResult(response.data);
      setFile(file);
      setCurrentStep(1);
      setProgress(40);
      message.success('文件上传成功！');
    } catch (error) {
      message.error('上传失败：' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
      setProgress(0);
    }

    return false; // 阻止默认上传行为
  };

  const handleTypeset = async () => {
    if (!uploadResult) {
      message.warning('请先上传文件');
      return;
    }

    setLoading(true);
    setProgress(60);

    try {
      const response = await axios.post('/api/typeset', {
        text: uploadResult.textPreview,
        extractedText: uploadResult.extractedText, // 传递完整的提取文本（可能来自docx解析）
        intent: intent,
        filename: uploadResult.filename
      });

      setTypesetResult(response.data);
      setHtmlPreview(response.data.html);
      setCurrentStep(2);
      setProgress(80);
      message.success('排版完成！');
    } catch (error) {
      message.error('排版失败：' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleConvertToWord = async () => {
    if (!typesetResult) {
      message.warning('请先生成排版');
      return;
    }

    setLoading(true);
    setProgress(90);

    try {
      const response = await axios.post('/api/convert-to-word', {
        html: typesetResult.html,
        filename: `排版文档_${new Date().toISOString().slice(0, 10)}.docx`
      });

      setWordResult(response.data);
      setCurrentStep(3);
      setProgress(100);
      
      // 自动下载Word文档
      window.open(`http://localhost:5000${response.data.downloadUrl}`, '_blank');
      
      message.success('Word文档生成成功！');
    } catch (error) {
      message.error('转换失败：' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setFile(null);
    setIntent('标准排版，包括标题、段落、列表等基本格式');
    setUploadResult(null);
    setTypesetResult(null);
    setWordResult(null);
    setHtmlPreview('');
    message.info('已重置，开始新的排版流程');
  };

  const uploadProps = {
    beforeUpload: handleFileUpload,
    showUploadList: false,
    accept: '.txt,.md,.doc,.docx',
    maxCount: 1
  };

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <FileTextOutlined style={{ fontSize: '24px', color: '#fff' }} />
            <Title level={3} style={{ margin: 0, color: '#fff' }}>快速排版系统</Title>
          </Space>
          <Text style={{ color: 'rgba(255,255,255,0.8)' }}>AI智能排版 · 一键生成Word</Text>
        </Space>
      </Header>

      <Content className="app-content">
        <div className="container">
          <Card className="main-card">
            <Steps current={currentStep} className="process-steps">
              {steps.map((step, index) => (
                <Step 
                  key={index} 
                  title={step.title} 
                  description={step.description}
                  icon={step.icon}
                />
              ))}
            </Steps>

            {progress > 0 && (
              <div style={{ margin: '20px 0' }}>
                <Progress percent={progress} status="active" />
              </div>
            )}

            <Divider />

            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card 
                  title={<Space><UploadOutlined /> 上传文本文件</Space>}
                  className="step-card"
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Alert 
                      message="支持格式" 
                      description="TXT, Markdown, Word文档 (.txt, .md, .doc, .docx)"
                      type="info"
                      showIcon
                    />
                    
                    <Upload.Dragger {...uploadProps}>
                      <p className="ant-upload-drag-icon">
                        <UploadOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                      </p>
                      <p className="ant-upload-text">点击或拖拽文件到此区域</p>
                      <p className="ant-upload-hint">
                        支持单个文件上传，最大10MB
                      </p>
                    </Upload.Dragger>

                    {file && (
                      <Alert
                        message="已选择文件"
                        description={file.name}
                        type="success"
                        showIcon
                        action={[
                          <Button key="view" size="small" type="link">
                            查看
                          </Button>
                        ]}
                      />
                    )}
                  </Space>
                </Card>

                {/* 移除独立的排版意图设置卡片 */}
              </Col>

              <Col xs={24} lg={12}>
                <Card 
                  title={<Space><CodeOutlined /> 排版结果与操作</Space>}
                  className="step-card"
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {/* 添加排版意图设置区域，位于上传信息之前 */}
                    <Card 
                      title={<Space><SettingOutlined /> 排版意图设置</Space>}
                      size="small"
                      style={{ marginBottom: '16px' }}
                    >
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong>描述您想要的排版效果：</Text>
                        <TextArea
                          rows={3}
                          value={intent}
                          onChange={(e) => setIntent(e.target.value)}
                          placeholder="例如：标准排版，包括标题、段落、列表等基本格式"
                        />
                        
                        <div>
                          <Text type="secondary">示例意图：</Text>
                          <Space wrap style={{ marginTop: '8px' }}>
                            <Tag 
                              color="blue" 
                              onClick={() => setIntent('学术论文格式，包含摘要、章节、参考文献')}
                              style={{ cursor: 'pointer' }}
                            >
                              学术论文
                            </Tag>
                            <Tag 
                              color="green" 
                              onClick={() => setIntent('商业报告格式，包含封面、目录、页眉页脚')}
                              style={{ cursor: 'pointer' }}
                            >
                              商业报告
                            </Tag>
                            <Tag 
                              color="orange" 
                              onClick={() => setIntent('技术文档格式，包含代码块、表格、图表说明')}
                              style={{ cursor: 'pointer' }}
                            >
                              技术文档
                            </Tag>
                          </Space>
                        </div>
                      </Space>
                    </Card>

                    {uploadResult && (
                      <Descriptions title="上传信息" bordered size="small">
                        <Descriptions.Item label="文件名" span={3}>
                          {uploadResult.filename}
                        </Descriptions.Item>
                        <Descriptions.Item label="文本预览" span={3}>
                          <Paragraph ellipsis={{ rows: 2 }}>
                            {uploadResult.textPreview}
                          </Paragraph>
                        </Descriptions.Item>
                        <Descriptions.Item label="排版意图" span={3}>
                          {intent}
                        </Descriptions.Item>
                      </Descriptions>
                    )}

                    <div style={{ marginTop: '16px' }}>
                      <Space>
                        <Button 
                          type="primary" 
                          onClick={handleTypeset}
                          loading={loading}
                          disabled={!uploadResult}
                          icon={<CodeOutlined />}
                        >
                          开始AI排版
                        </Button>
                        
                        <Button 
                          type="default" 
                          onClick={handleConvertToWord}
                          loading={loading}
                          disabled={!typesetResult}
                          icon={<DownloadOutlined />}
                        >
                          生成Word文档
                        </Button>
                        
                        <Button 
                          onClick={handleReset}
                          icon={<CheckCircleOutlined />}
                        >
                          重新开始
                        </Button>
                      </Space>
                    </div>

                    {typesetResult && (
                      <Alert
                        message="排版完成"
                        description={`HTML代码已生成，共${typesetResult.html.length}个字符`}
                        type="success"
                        showIcon
                        style={{ marginTop: '16px' }}
                      />
                    )}

                    {wordResult && (
                      <Alert
                        message="Word文档已就绪"
                        description={<>
                          <Text>文件：{wordResult.filename}</Text><br />
                          <Button 
                            type="link" 
                            href={`http://localhost:5000${wordResult.downloadUrl}`}
                            target="_blank"
                            icon={<DownloadOutlined />}
                          >
                            点击下载
                          </Button>
                        </>}
                        type="success"
                        showIcon
                        style={{ marginTop: '16px' }}
                      />
                    )}
                  </Space>
                </Card>

                {htmlPreview && (
                  <Card 
                    title="HTML预览" 
                    className="step-card"
                    style={{ marginTop: '24px' }}
                  >
                    <div 
                      className="html-preview"
                      dangerouslySetInnerHTML={{ __html: htmlPreview }}
                      style={{ 
                        maxHeight: '400px', 
                        overflow: 'auto',
                        border: '1px solid #f0f0f0',
                        padding: '16px',
                        borderRadius: '4px'
                      }}
                    />
                    
                    <Button 
                      type="link" 
                      href={`http://localhost:5000${typesetResult?.htmlUrl}`}
                      target="_blank"
                      style={{ marginTop: '12px' }}
                    >
                      在新窗口查看完整HTML
                    </Button>
                  </Card>
                )}
              </Col>
            </Row>

            {loading && (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin 
                  indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} 
                  tip="处理中，请稍候..."
                />
              </div>
            )}
          </Card>

          <Card className="info-card" style={{ marginTop: '24px' }}>
            <Title level={4}>💡 使用提示</Title>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Space direction="vertical">
                  <Text strong>📁 文件准备</Text>
                  <Text type="secondary">确保文本文件内容清晰，格式规范，便于AI理解。</Text>
                </Space>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Space direction="vertical">
                  <Text strong>🎯 意图明确</Text>
                  <Text type="secondary">详细描述排版要求，AI会根据您的意图生成更精准的结果。</Text>
                </Space>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Space direction="vertical">
                  <Text strong>⚙️ 配置检查</Text>
                  <Text type="secondary">请确保已正确配置DeepSeek API密钥在.env文件中。</Text>
                </Space>
              </Col>
            </Row>
          </Card>
        </div>
      </Content>

      <Footer className="app-footer">
        <Space direction="vertical" align="center" style={{ width: '100%' }}>
          <Text type="secondary">
            快速排版系统 © {new Date().getFullYear()} · 基于DeepSeek API
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            技术支持：Node.js + Express + React + Ant Design
          </Text>
        </Space>
      </Footer>
    </Layout>
  );
}

export default App;