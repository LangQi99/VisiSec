# 端侧模型部署指南

## 概述

VisiSec使用轻量级的端侧模型进行实时推理。所有边缘模型代码位于 `src/services/edgeModels.js`。

## 已集成的功能 ✅

### 1. 场景变化检测 (SceneChangeDetector)
- 使用TensorFlow.js处理图像
- 计算帧间差异检测PPT翻页、白板更新
- 自动识别关键帧

### 2. 注意力评分 (AttentionScorer)  
- 基于IMU数据分析设备运动
- 监控应用前后台切换
- 生成注意力得分和时间线

### 3. OCR占位符 (SimpleOCR)
- 为未来真实OCR集成做准备

## 使用方法

```javascript
import { edgeModelManager } from './services/edgeModels'
import { sensorManager } from './services/sensors'

// 初始化
await edgeModelManager.initializeAll()

// 处理帧
const frame = await sensorManager.captureKeyframe('REAR')
const sensorData = await sensorManager.collectAllData()
const analysis = await edgeModelManager.processFrame(frame.base64, sensorData)
```

## 日志系统 ✅

所有重要操作都会打印详细日志，方便调试：

```
🚀 [EdgeModel] Initializing all edge models...
✅ [EdgeModel] TensorFlow.js backend: webgl
⚙️ [EdgeModel] Processing frame...
✅ [EdgeModel] Frame processing complete
```

## 性能优化建议

1. 控制处理频率（每10秒一次）
2. 使用WebGL后端加速
3. 及时释放tensor资源
4. 降低图像分辨率

详细文档请参考代码注释。
