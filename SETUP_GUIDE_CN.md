# VisiSec 配置和使用指南

## 🎯 项目概述

VisiSec（视界秘书）是一个智能会议助手应用，使用多模态感知技术捕捉和分析会议内容。

### 主要特性

1. ✅ **中文界面** - 完全本地化的中文用户界面，使用 Noto Sans SC 和 Noto Serif SC 字体
2. ✅ **Flask 后端** - 运行在端口 5124，支持 CORS
3. ✅ **Silicon Flow LLM 集成** - DeepSeek-V3 模型用于会议摘要生成
4. ✅ **详细日志** - 所有关键操作都有清晰的日志记录，带有表情符号指示器
5. ✅ **前后端通信** - 完整的 API 服务层，支持双向通信

## 📋 环境要求

### 后端
- Python 3.9+
- pip 或 uv 包管理器

### 前端
- Node.js 18+
- npm

## 🚀 快速开始

### 1. 后端配置

#### 安装依赖

```bash
cd backend
pip install -e .
# 或者使用 uv
uv pip install -e .
```

#### 配置环境变量

创建 `.env` 文件（参考 `.env.example`）：

```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件：

```env
# DeepSeek API Configuration (Silicon Flow)
SILICON_FLOW_API_KEY=your_api_key_here
SILICON_FLOW_MODEL=deepseek-ai/DeepSeek-V3
SILICON_FLOW_API_URL=https://api.siliconflow.cn/v1/chat/completions

# Flask Server Configuration
FLASK_HOST=0.0.0.0
FLASK_PORT=5124
FLASK_DEBUG=False
```

⚠️ **重要**: 必须设置 `SILICON_FLOW_API_KEY` 才能使用 LLM 功能！

#### 启动后端服务器

```bash
cd backend
python3 src/visisec_backend/main.py
```

服务器将在 `http://0.0.0.0:5124` 启动。

**日志输出示例**:
```
================================================================================
VisiSec Backend Starting...
================================================================================
Silicon Flow API URL: https://api.siliconflow.cn/v1/chat/completions
Silicon Flow Model: deepseek-ai/DeepSeek-V3
API Key configured: Yes
Flask Host: 0.0.0.0
Flask Port: 5124
Flask Debug Mode: False
================================================================================
🚀 Starting Flask server...
   Host: 0.0.0.0
   Port: 5124
   Debug: False
================================================================================
```

### 2. 前端配置

#### 安装依赖

```bash
cd frontend
npm install
```

#### 配置 API 地址

创建 `.env` 文件（参考 `.env.example`）：

```bash
cd frontend
cp .env.example .env
```

编辑 `.env` 文件：

```env
# Backend API Configuration
VITE_API_URL=http://localhost:5124
```

#### 启动开发服务器

```bash
cd frontend
npm run dev
```

前端将在 `http://localhost:5173` 启动。

#### 构建生产版本

```bash
cd frontend
npm run build
```

构建输出在 `dist/` 目录。

## 🧪 测试 API 连接

### 1. 测试后端健康检查

```bash
curl http://localhost:5124/
```

期望输出：
```json
{
    "status": "healthy",
    "service": "VisiSec Backend",
    "version": "0.2.0",
    "llm_configured": true,
    "timestamp": "2026-01-30T08:13:14.865697"
}
```

### 2. 测试注意力分析

```bash
curl -X POST http://localhost:5124/api/v1/analyze/attention \
  -H "Content-Type: application/json" \
  -d '{
    "imu_data": [],
    "app_state": [],
    "gaze_data": []
  }'
```

### 3. 测试 LLM 集成

```bash
curl -X POST http://localhost:5124/api/v1/test-llm \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "你好，请介绍一下你自己。"
  }'
```

### 4. 在前端测试连接

打开浏览器访问 `http://localhost:5173`，点击首页的"测试连接"按钮。

## 📡 API 端点

### 健康检查
- **GET** `/` - 健康检查和配置状态

### 文件上传
- **POST** `/api/v1/upload/audio` - 上传音频文件
- **POST** `/api/v1/upload/video` - 上传视频文件

### 分析
- **POST** `/api/v1/analyze/attention` - 分析注意力模式
- **POST** `/api/v1/analyze/keyframes` - 提取关键帧

### 会议摘要
- **GET** `/api/v1/meetings/{meeting_id}/summary` - 获取会议摘要（使用 LLM）

### 测试
- **POST** `/api/v1/test-llm` - 测试 LLM API 连接

## 🔍 日志说明

### 日志位置
- **后端**: `backend/visisec_backend.log` 和控制台输出
- **前端**: 浏览器控制台

### 日志级别和标识
- 🚀 启动和初始化
- ✅ 成功操作
- ❌ 错误
- ⚠️ 警告
- 📤 发送请求
- 📥 接收响应
- 🤖 LLM API 调用
- 🧠 注意力分析
- 📝 摘要生成
- 🔍 检测和搜索
- 📊 数据处理

### 查看实时日志

```bash
# 后端日志
tail -f backend/visisec_backend.log

# 或查看控制台输出
cd backend && python3 src/visisec_backend/main.py
```

## 🎨 前端功能

### 中文界面
所有文本已翻译为中文：
- 导航: "首页", "录制会议"
- 功能卡片: "视觉捕捉", "音频录制", "智能分析"
- 按钮: "开始录制", "停止录制", "测试连接"

### 字体支持
- **标题字体**: Noto Serif SC（衬线字体，优雅权威）
- **正文字体**: Noto Sans SC（无衬线字体，清晰易读）

### 连接测试
在首页点击"测试连接"按钮将：
1. 调用后端健康检查 API
2. 显示连接状态（成功/失败）
3. 显示 LLM 配置状态
4. 所有操作在控制台有详细日志

## 📱 端侧模型部署

详见 `frontend/EDGE_MODEL_DEPLOYMENT.md`

推荐的轻量级模型：
- **MobileNetV3-Small** (~2.5MB) - 图像分类
- **SqueezeNet** (~5MB) - 轻量级分类
- **EfficientNet-Lite0** (~4.5MB) - 高效分类
- **YOLO-Nano** (~4MB) - 实时物体检测

## 🔧 故障排除

### 后端无法启动
1. 检查端口 5124 是否被占用：`lsof -i :5124`
2. 确认 Python 版本 >= 3.9
3. 重新安装依赖：`pip install -e .`

### LLM 功能不工作
1. 检查 `.env` 文件中的 `SILICON_FLOW_API_KEY` 是否设置
2. 检查日志中是否有 "⚠️  WARNING: SILICON_FLOW_API_KEY is not set!"
3. 测试 API 密钥：`curl -X POST http://localhost:5124/api/v1/test-llm`

### 前端无法连接后端
1. 确认后端正在运行：`curl http://localhost:5124/`
2. 检查 `.env` 中的 `VITE_API_URL` 设置
3. 查看浏览器控制台网络请求
4. 检查 CORS 配置

### 中文显示问题
1. 确认字体已加载（查看浏览器网络面板）
2. 清除浏览器缓存
3. 检查 `style.css` 中的字体导入

## 📚 更多信息

### 技术栈
- **后端**: Flask, httpx, python-dotenv
- **前端**: Vue 3, Vite, Tailwind CSS 4, Capacitor
- **LLM**: Silicon Flow DeepSeek-V3
- **字体**: Noto Sans SC, Noto Serif SC

### 开发模式 vs 生产模式
- **开发**: `FLASK_DEBUG=True` - 自动重载，详细错误
- **生产**: `FLASK_DEBUG=False` - 推荐使用 Gunicorn 或 uWSGI

### 生产部署建议
```bash
# 使用 Gunicorn 部署
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5124 src.visisec_backend.main:app
```

## 🤝 贡献

欢迎贡献！请确保：
1. 所有新功能都有日志记录
2. 更新相关文档
3. 测试前后端通信

## 📄 许可证

MIT License
