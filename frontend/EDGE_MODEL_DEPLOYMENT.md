# 端侧模型部署指南

## 概述

VisiSec 前端需要轻量级的端侧模型来实现以下功能：

1. **实时帧变化检测** - 检测PPT幻灯片切换和白板内容变化
2. **注意力评分** - 基于视觉数据评估用户注意力
3. **场景分类** - 识别会议场景类型

## 推荐的轻量级模型

### 1. MobileNet 系列

**用途**: 图像分类和场景识别

- **MobileNetV3-Small**: ~2.5MB, 适合移动设备
- **MobileNetV3-Large**: ~5.5MB, 更高精度
- **部署方式**: TensorFlow Lite 或 ONNX Runtime

```javascript
// 示例: 使用 TensorFlow.js 加载 MobileNet
import * as tf from '@tensorflow/tfjs'

const model = await tf.loadLayersModel('/models/mobilenet_v3_small/model.json')
```

### 2. SqueezeNet

**用途**: 轻量级图像分类

- **模型大小**: ~5MB
- **优势**: 极小的模型尺寸，快速推理
- **部署方式**: ONNX.js 或 TensorFlow.js

### 3. EfficientNet-Lite

**用途**: 高效图像分类

- **EfficientNet-Lite0**: ~4.5MB
- **精度/效率平衡**: 优秀
- **部署方式**: TensorFlow Lite

### 4. 专用场景检测

**推荐**: 使用预训练的 YOLO-Nano 或 Tiny-YOLO 进行物体检测

- **YOLO-Nano**: ~4MB, 实时检测
- **用途**: 检测幻灯片、白板等会议元素

## 部署步骤

### 方案 1: TensorFlow.js (推荐用于 Web)

1. **安装依赖**:
```bash
npm install @tensorflow/tfjs @tensorflow/tfjs-backend-webgl
```

2. **加载模型**:
```javascript
import * as tf from '@tensorflow/tfjs'

// 设置 WebGL 后端以获得更好性能
await tf.setBackend('webgl')

// 加载模型
const model = await tf.loadLayersModel('/models/model.json')
```

3. **推理**:
```javascript
async function classifyFrame(imageElement) {
  const tensor = tf.browser.fromPixels(imageElement)
    .resizeBilinear([224, 224])
    .expandDims(0)
    .div(255.0)
  
  const predictions = await model.predict(tensor)
  tensor.dispose()
  
  return predictions
}
```

### 方案 2: ONNX Runtime Web

1. **安装依赖**:
```bash
npm install onnxruntime-web
```

2. **使用示例**:
```javascript
import * as ort from 'onnxruntime-web'

const session = await ort.InferenceSession.create('/models/model.onnx')
```

### 方案 3: MediaPipe (Google)

**推荐用于**: 手势识别、人脸检测

```bash
npm install @mediapipe/tasks-vision
```

## 性能优化建议

1. **模型量化**: 使用 INT8 量化减少模型大小
2. **批处理**: 批量处理视频帧以提高效率
3. **Web Workers**: 在后台线程运行推理
4. **缓存**: 缓存模型和中间结果

## 集成到 VisiSec

### 创建模型服务

```javascript
// src/services/edgeModel.js
import * as tf from '@tensorflow/tfjs'

class EdgeModelService {
  constructor() {
    this.model = null
  }
  
  async init() {
    console.log('🤖 Loading edge model...')
    await tf.setBackend('webgl')
    this.model = await tf.loadLayersModel('/models/scene_detector/model.json')
    console.log('✅ Edge model loaded successfully')
  }
  
  async detectFrameChange(currentFrame, previousFrame) {
    // 实现帧变化检测逻辑
    console.log('🔍 Detecting frame changes...')
    // ... 实现细节
  }
  
  async scoreAttention(frameData) {
    // 实现注意力评分逻辑
    console.log('📊 Scoring attention...')
    // ... 实现细节
  }
}

export default new EdgeModelService()
```

### 在组件中使用

```vue
<script setup>
import { onMounted } from 'vue'
import edgeModel from '../services/edgeModel'

onMounted(async () => {
  await edgeModel.init()
  console.log('✅ Edge model initialized')
})
</script>
```

## 模型训练和优化

如需自定义模型:

1. 使用 TensorFlow 或 PyTorch 训练
2. 转换为 TensorFlow.js 格式:
   ```bash
   tensorflowjs_converter \
     --input_format=tf_saved_model \
     --output_format=tfjs_graph_model \
     saved_model_dir/ \
     web_model/
   ```
3. 量化以减小大小:
   ```bash
   tensorflowjs_converter \
     --input_format=tf_saved_model \
     --output_format=tfjs_graph_model \
     --quantize_uint8 \
     saved_model_dir/ \
     web_model/
   ```

## 资源链接

- [TensorFlow.js 文档](https://www.tensorflow.org/js)
- [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/)
- [MediaPipe](https://developers.google.com/mediapipe)
- [模型优化指南](https://www.tensorflow.org/lite/performance/model_optimization)

## 注意事项

⚠️ **重要日志点**:
- 模型加载开始和完成
- 推理开始和结束时间
- 错误和异常
- 性能指标 (FPS, 延迟)

所有关键操作都应该有详细的日志输出以便调试。
