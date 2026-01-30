# VisiSec 权限配置指南

## 概述

VisiSec 是一个多模态会议助理应用，需要访问多种设备传感器和硬件功能。本文档详细说明了各项权限的用途和配置方法。

## 所需权限列表

### 1. 运动传感器 (Motion Sensors)

**用途**: 捕获设备的加速度计和陀螺仪数据，用于分析用户的注意力和设备姿态。

#### iOS 配置
- **权限**: 通过 `DeviceMotionEvent.requestPermission()` 请求
- **触发时机**: 用户点击"开始录制"按钮时
- **Info.plist**: 不需要额外配置（iOS 13+ Safari 会自动弹出权限对话框）

#### Android 配置
- **权限**: `android.permission.ACTIVITY_RECOGNITION` (Android 10+)
- **权限**: `android.permission.HIGH_SAMPLING_RATE_SENSORS`
- **特性声明**: 
  - `android.hardware.sensor.accelerometer` (非必需)
  - `android.hardware.sensor.gyroscope` (非必需)
- **触发时机**: 自动可用，无需显式请求
- **配置位置**: `android/app/src/main/AndroidManifest.xml`

### 2. 相机 (Camera)

**用途**: 
- 前置摄像头: 捕获用户面部表情和视线方向，用于注意力分析
- 后置摄像头: 捕获会议现场（PPT、白板）内容，用于场景分析

#### iOS 配置
- **权限**: 通过 Capacitor Camera 插件自动处理
- **Info.plist 需要添加**:
  ```xml
  <key>NSCameraUsageDescription</key>
  <string>VisiSec 需要访问相机来捕获会议内容和分析注意力</string>
  ```

#### Android 配置
- **权限**: `android.permission.CAMERA`
- **特性声明**:
  - `android.hardware.camera` (非必需)
  - `android.hardware.camera.front` (非必需)
  - `android.hardware.camera.autofocus` (非必需)
- **配置位置**: `android/app/src/main/AndroidManifest.xml`

### 3. 麦克风 (Microphone)

**用途**: 录制会议音频，进行语音转文字和智能总结。

#### iOS 配置
- **Info.plist 需要添加**:
  ```xml
  <key>NSMicrophoneUsageDescription</key>
  <string>VisiSec 需要访问麦克风来录制会议音频</string>
  ```

#### Android 配置
- **权限**: 
  - `android.permission.RECORD_AUDIO`
  - `android.permission.MODIFY_AUDIO_SETTINGS`
- **配置位置**: `android/app/src/main/AndroidManifest.xml`

### 4. 文件存储 (Storage)

**用途**: 保存录制的音频、关键帧图片和会议数据。

#### iOS 配置
- 通过 Capacitor 插件自动处理

#### Android 配置
- **权限** (Android 12 及以下):
  - `android.permission.READ_EXTERNAL_STORAGE` (maxSdkVersion="32")
  - `android.permission.WRITE_EXTERNAL_STORAGE` (maxSdkVersion="32")
- **权限** (Android 13+):
  - `android.permission.READ_MEDIA_IMAGES`
  - `android.permission.READ_MEDIA_VIDEO`
- **配置位置**: `android/app/src/main/AndroidManifest.xml`

### 5. 网络 (Network)

**用途**: 与后端服务器通信，上传传感器数据和接收分析结果。

#### Android 配置
- **权限**:
  - `android.permission.INTERNET`
  - `android.permission.ACCESS_NETWORK_STATE`
- **配置位置**: `android/app/src/main/AndroidManifest.xml`

## 权限请求流程

### 应用启动时
1. 不会请求任何权限
2. 仅初始化边缘 AI 模型

### 用户点击"开始录制"时
1. **IMU 传感器** (iOS):
   - 调用 `DeviceMotionEvent.requestPermission()`
   - 用户看到系统权限对话框
   - 需要用户批准才能继续
   
2. **IMU 传感器** (Android):
   - 自动开始收集数据
   - 无需用户交互

3. **相机**:
   - Capacitor Camera 插件自动请求权限
   - 用户看到系统权限对话框
   - 需要用户批准才能继续

4. **麦克风**:
   - `navigator.mediaDevices.getUserMedia()` 自动请求权限
   - 用户看到浏览器/系统权限对话框
   - 需要用户批准才能继续

### 权限被拒绝时
- 应用会在控制台输出详细的错误日志
- 用户会看到错误提示消息
- 录制无法开始，需要用户在系统设置中手动授予权限

## 调试和日志

### 启用详细日志
应用已内置详细的日志系统，所有权限相关的操作都会记录：

```javascript
// 示例日志输出
🚀 [12:34:56.789] [Sensors] Starting IMU sensors...
🔍 [12:34:56.790] [Sensors] Platform detected: android
   📊 Data: {
     "platform": "android",
     "model": "Pixel 6",
     "operatingSystem": "android",
     "osVersion": "13"
   }
✅ [12:34:56.791] [Sensors] Motion sensors available on android (no permission required)
✅ [12:34:56.950] [Sensors] IMU sensors started successfully
```

### 检查权限状态

#### Android
```bash
# 通过 ADB 检查应用权限
adb shell dumpsys package com.visisec.app | grep permission
```

#### iOS
通过 Xcode 或设备设置应用查看权限状态。

## 常见问题

### Q1: Android 上出现 "Motion.requestPermission() is not implemented"
**A**: 这是正常的！Android 不需要通过 Motion 插件请求权限。传感器数据会自动可用。这个错误已在最新版本中修复。

### Q2: iOS 上点击"开始录制"没有弹出权限对话框
**A**: 确保你的应用运行在用户触发的事件中（如按钮点击）。iOS Safari 要求权限请求必须在用户交互的上下文中进行。

### Q3: 相机权限被拒绝后如何恢复
**A**: 用户需要在系统设置中手动授予权限：
- **iOS**: 设置 → 隐私 → 相机 → VisiSec
- **Android**: 设置 → 应用 → VisiSec → 权限 → 相机

### Q4: 传感器数据不准确或没有数据
**A**: 检查以下几点：
1. 确保设备支持所需的传感器（加速度计、陀螺仪）
2. 检查浏览器控制台是否有错误日志
3. 确认所有权限都已授予
4. 尝试重启应用

## 最佳实践

1. **在用户交互时请求权限**: 始终在用户点击按钮等明确操作时请求权限，而不是在应用启动时。

2. **提供清晰的说明**: 在请求权限前，向用户解释为什么需要该权限。

3. **优雅处理拒绝**: 如果用户拒绝权限，提供清晰的错误消息和如何授予权限的指导。

4. **测试不同场景**: 在不同的设备和 OS 版本上测试权限流程。

## 技术参考

- [Capacitor Motion Plugin](https://capacitorjs.com/docs/apis/motion)
- [Capacitor Camera Plugin](https://capacitorjs.com/docs/apis/camera)
- [DeviceMotionEvent API](https://developer.mozilla.org/en-US/docs/Web/API/DeviceMotionEvent)
- [MediaDevices.getUserMedia()](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [Android Permissions](https://developer.android.com/guide/topics/permissions/overview)
- [iOS Privacy - Requesting Authorization](https://developer.apple.com/documentation/uikit/protecting_the_user_s_privacy/requesting_authorization)
