# VisiSec 完整使用指南

## 📋 项目概述

VisiSec（视界秘书）是一个多模态智能会议助手，融合了：
- 👁️ 视觉感知（前置和后置摄像头）
- 🎤 听觉捕捉（高保真音频录制）
- 📱 行为分析（IMU传感器、应用状态）
- 🤖 边缘计算（端侧AI模型推理）
- ☁️ 云端处理（LLM摘要、OCR识别）

## 🚀 快速开始

### 环境要求

**后端**：
- Python 3.9+
- pip或uv包管理器

**前端**：
- Node.js 18+
- npm

**可选**：
- Android Studio（用于移动端开发）

### 安装步骤

#### 1. 克隆仓库

```bash
git clone https://github.com/LangQi99/VisiSec.git
cd VisiSec
```

#### 2. 后端安装

```bash
cd backend

# 安装依赖
pip install -e .

# 或使用uv（更快）
uv pip install -e .

# 创建环境配置
cp .env.example .env

# 编辑.env文件，添加API密钥
nano .env
```

**必需的环境变量**：
```env
# Silicon Flow LLM API（可选，用于AI摘要）
SILICON_FLOW_API_KEY=your_api_key_here
SILICON_FLOW_MODEL=deepseek-ai/DeepSeek-V3
SILICON_FLOW_API_URL=https://api.siliconflow.cn/v1/chat/completions

# 服务器配置
FLASK_HOST=0.0.0.0
FLASK_PORT=5124
FLASK_DEBUG=False

# CORS配置（生产环境请修改为实际域名）
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8080

# 安全限制
MAX_FILE_SIZE=104857600  # 100MB
MAX_PROMPT_LENGTH=2000
```

#### 3. 前端安装

```bash
cd ../frontend

# 安装依赖
npm install

# 创建环境配置
cp .env.example .env

# 编辑.env文件
nano .env
```

**前端环境变量**：
```env
VITE_API_URL=http://localhost:5124
```

## 🎮 运行应用

### 开发模式

**终端1 - 启动后端**：
```bash
cd backend
python3 src/visisec_backend/main.py
```

您将看到：
```
================================================================================
🚀 Starting Flask server with WebSocket support...
   Host: 0.0.0.0
   Port: 5124
   Debug: False
================================================================================
 * Running on http://127.0.0.1:5124
```

**终端2 - 启动前端**：
```bash
cd frontend
npm run dev
```

浏览器访问：http://localhost:5173

### 生产模式

**后端**：
```bash
cd backend

# 使用Gunicorn（推荐）
gunicorn -w 4 -b 0.0.0.0:5124 \
  --worker-class eventlet \
  src.visisec_backend.main:app

# 或使用uwsgi
uwsgi --http :5124 \
  --wsgi-file src/visisec_backend/main.py \
  --callable app
```

**前端**：
```bash
cd frontend
npm run build

# 将dist/目录部署到Web服务器（Nginx/Apache）
# 或使用静态文件服务器
npx serve dist -p 8080
```

## 📱 移动端开发

### Android

```bash
cd frontend

# 构建并同步到Android
npm run build
npx cap sync android

# 在Android Studio中打开
npx cap open android

# 或使用便捷脚本
npm run build:android
```

### iOS（需要macOS）

```bash
cd frontend

npm run build
npx cap add ios
npx cap sync ios
npx cap open ios
```

## 🔧 核心功能详解

### 1. 传感器采集（sensors.js）

**功能**：
- ✅ IMU数据采集（加速度计、陀螺仪）
- ✅ 相机拍照（前置/后置）
- ✅ 音频录制（MediaRecorder API）
- ✅ 应用状态监控

**使用示例**：
```javascript
import { sensorManager } from './services/sensors'

// 启动所有传感器
const result = await sensorManager.startAll()
console.log('传感器状态:', result.sensors)

// 收集数据
const data = await sensorManager.collectAllData()
console.log('传感器数据:', data)

// 停止传感器
await sensorManager.stopAll()
```

**日志输出**：
```
🚀 [Sensors] Starting all sensors...
✅ [Sensors] IMU sensors started successfully
✅ [Sensors] Camera permissions already granted
✅ [Sensors] Audio recording started
📊 [Sensors] IMU data collected: 100 points
```

### 2. 边缘模型（edgeModels.js）

**功能**：
- ✅ 场景变化检测（PPT翻页识别）
- ✅ 注意力评分（基于传感器数据）
- 📝 OCR文字识别（占位符）

**使用示例**：
```javascript
import { edgeModelManager } from './services/edgeModels'

// 初始化模型
await edgeModelManager.initializeAll()

// 处理单帧
const frame = await sensorManager.captureKeyframe('REAR')
const sensorData = await sensorManager.collectAllData()

const analysis = await edgeModelManager.processFrame(
  frame.base64,
  sensorData
)

console.log('分析结果:', analysis)
// {
//   timestamp: 1706601234567,
//   sceneChange: { changed: true, isKeyframe: true },
//   attention: { score: 0.85, level: 'high', color: 'green' },
//   isKeyframe: true
// }
```

**日志输出**：
```
🚀 [EdgeModel] Initializing all edge models...
✅ [EdgeModel] TensorFlow.js backend: webgl
⚙️ [EdgeModel] Processing frame...
🔍 [EdgeModel] Detecting scene change...
✅ [EdgeModel] Scene change detection complete
🧠 [EdgeModel] Calculating attention score...
```

### 3. WebSocket通信（websocket.js）

**功能**：
- ✅ 实时双向通信
- ✅ 会话管理
- ✅ 自动重连
- ✅ 事件处理

**使用示例**：
```javascript
import { wsClient } from './services/websocket'

// 启动会话
const session = await wsClient.startSession('产品策略会议')
console.log('会话ID:', session.sessionId)

// 发送传感器数据
wsClient.sendSensorData(sensorData)

// 发送关键帧
wsClient.sendKeyframe(frameData)

// 注册结果处理器
wsClient.onAnalysisResult((result) => {
  console.log('收到分析结果:', result)
})

// 结束会话
await wsClient.endSession()
```

**日志输出**：
```
🔌 [WebSocket] Connecting to ws://localhost:5124/ws...
✅ [WebSocket] WebSocket connected successfully
🚀 [WebSocket] Starting meeting session...
📤 [WebSocket] Message sent: session_start
📥 [WebSocket] Message received: session_started
```

### 4. 后端API（main.py）

**端点列表**：

| 方法 | 端点 | 功能 |
|------|------|------|
| GET | `/` | 健康检查 |
| POST | `/api/v1/upload/audio` | 上传音频 |
| POST | `/api/v1/upload/video` | 上传视频 |
| POST | `/api/v1/analyze/attention` | 注意力分析 |
| POST | `/api/v1/analyze/keyframes` | 关键帧提取 |
| GET | `/api/v1/meetings/:id/summary` | 获取会议摘要 |
| POST | `/api/v1/test-llm` | 测试LLM连接 |

**WebSocket事件**：
- `connect` - 客户端连接
- `disconnect` - 客户端断开
- `session_start` - 开始会话
- `session_end` - 结束会话
- `sensor_data` - 传感器数据
- `keyframe` - 关键帧数据

**后端日志**：
```
================================================================================
🚀 Starting Flask server with WebSocket support...
================================================================================
🔌 WebSocket client connected
   Session ID: abc123xyz
🚀 Session start request received
   Meeting Title: 产品策略会议
✅ Session started successfully
   Recording ID: uuid-here
📊 Sensor data received for session abc123xyz
🖼️ Keyframe received
✅ Keyframe saved (total: 5)
```

## 🎯 完整录制流程

### 步骤1：初始化

```javascript
// Record.vue mounted hook
import { sensorManager } from '../services/sensors'
import { edgeModelManager } from '../services/edgeModels'

// 初始化边缘模型
await edgeModelManager.initializeAll()
```

### 步骤2：开始录制

```javascript
// 用户点击"开始录制"按钮
async function startRecording() {
  // 1. 启动传感器
  await sensorManager.startAll()
  
  // 2. 启动WebSocket会话
  await wsClient.startSession(meetingTitle.value)
  
  // 3. 每5秒发送传感器数据
  sensorDataInterval = setInterval(async () => {
    const data = await sensorManager.collectAllData()
    wsClient.sendSensorData(data)
  }, 5000)
  
  // 4. 每10秒捕获关键帧
  keyframeInterval = setInterval(async () => {
    const frame = await sensorManager.captureKeyframe('REAR')
    const sensorData = await sensorManager.collectAllData()
    const analysis = await edgeModelManager.processFrame(
      frame.base64,
      sensorData
    )
    
    if (analysis.isKeyframe) {
      wsClient.sendKeyframe({ ...frame, ...analysis })
    }
  }, 10000)
}
```

### 步骤3：停止录制

```javascript
async function stopRecording() {
  // 1. 停止定时器
  clearInterval(sensorDataInterval)
  clearInterval(keyframeInterval)
  
  // 2. 停止传感器
  await sensorManager.stopAll()
  
  // 3. 结束WebSocket会话
  const result = await wsClient.endSession()
  
  // 4. 发送最终分析
  const finalData = await sensorManager.collectAllData()
  const analysis = await analyzeAttention(finalData)
  
  // 5. 导航到结果页面
  router.push(`/timeline/${result.recordingId}`)
}
```

## 📊 数据流图

```
┌─────────────┐
│   用户操作   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│  传感器采集 (sensors.js)         │
│  - IMU数据                       │
│  - 相机帧                        │
│  - 音频流                        │
│  - 应用状态                      │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  边缘处理 (edgeModels.js)        │
│  - 场景变化检测                   │
│  - 注意力评分                     │
│  - 关键帧提取                     │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  WebSocket发送 (websocket.js)    │
│  - 实时传输到后端                 │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  后端处理 (main.py)              │
│  - 数据存储                      │
│  - LLM摘要                       │
│  - OCR识别                       │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  结果展示                        │
│  - 时间线热力图                   │
│  - 会议摘要                      │
│  - 行动项                        │
└─────────────────────────────────┘
```

## 🐛 故障排查

### 问题1：后端启动失败

**错误**：`ModuleNotFoundError: No module named 'flask_socketio'`

**解决**：
```bash
cd backend
pip install -e .
```

### 问题2：前端依赖冲突

**错误**：`ERESOLVE unable to resolve dependency tree`

**解决**：
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### 问题3：WebSocket连接失败

**症状**：浏览器控制台显示 `WebSocket connection failed`

**检查**：
1. 后端是否正在运行？
2. CORS配置是否包含前端URL？
3. 防火墙是否阻止端口5124？

**解决**：
```bash
# 检查后端
curl http://localhost:5124/

# 检查CORS
# 编辑 backend/.env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8080
```

### 问题4：相机权限被拒绝

**症状**：`NotAllowedError: Permission denied`

**解决**：
1. 浏览器地址栏点击锁图标
2. 允许相机和麦克风权限
3. 刷新页面

### 问题5：TensorFlow.js加载慢

**症状**：模型初始化需要很长时间

**优化**：
```javascript
// 使用WebGL后端
import * as tf from '@tensorflow/tfjs'
await tf.setBackend('webgl')
await tf.ready()
```

## 📈 性能优化建议

### 前端

1. **减少处理频率**：
```javascript
// 从每秒处理改为每10秒
setInterval(processFrame, 10000)  // 而不是1000
```

2. **降低图像分辨率**：
```javascript
const tensor = tf.browser.fromPixels(img)
  .resizeNearestNeighbor([224, 224])  // 使用224x224而不是原始尺寸
```

3. **及时释放内存**：
```javascript
// 处理完后立即释放
tensor.dispose()

// 或使用tidy
tf.tidy(() => {
  // 所有tensor会自动释放
  const result = model.predict(input)
  return result.dataSync()
})
```

### 后端

1. **使用生产WSGI服务器**：
```bash
gunicorn -w 4 --worker-class eventlet src.visisec_backend.main:app
```

2. **启用Redis缓存**：
```python
from redis import Redis
cache = Redis(host='localhost', port=6379)
```

3. **异步处理重任务**：
```python
from celery import Celery
app = Celery('visisec', broker='redis://localhost:6379')

@app.task
def process_video(video_id):
    # 异步处理视频
    pass
```

## 🔒 安全注意事项

1. **生产环境必须使用HTTPS**
2. **设置严格的CORS策略**
3. **限制文件上传大小**
4. **验证所有用户输入**
5. **不要在前端暴露API密钥**

## 📚 更多资源

- [边缘模型部署指南](./frontend/EDGE_MODEL_DEPLOYMENT.md)
- [API文档](http://localhost:5124/docs) （Swagger）
- [项目README](./README.md)

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

---

**祝您使用愉快！如有问题，请查看日志输出或提交Issue。**
