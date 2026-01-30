/**
 * VisiSec Sensor Service
 * 多模态传感器数据采集服务
 * 
 * 采集：
 * - IMU数据 (加速度计、陀螺仪)
 * - 相机流 (前置和后置)
 * - 应用状态
 */

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Motion } from '@capacitor/motion'
import { Device } from '@capacitor/device'
import { Capacitor } from '@capacitor/core'

// 日志辅助函数
const log = (emoji, message, data = null) => {
  console.log(`${emoji} [Sensors] ${message}`)
  if (data) {
    console.log('   📊 Data:', data)
  }
}

// 平台检测
const isNative = () => Capacitor.isNativePlatform()
const isWeb = () => !Capacitor.isNativePlatform()
const platform = Capacitor.getPlatform()

/**
 * IMU传感器管理器
 */
class IMUSensorManager {
  constructor() {
    this.isActive = false
    this.data = []
    this.listener = null
    this.maxDataPoints = 1000 // 限制内存使用
    this.webMotionHandler = null // Web平台的motion handler
  }

  async start() {
    if (this.isActive) {
      log('⚠️', 'IMU sensors already active')
      return
    }

    try {
      log('🚀', `Starting IMU sensors on ${platform} platform...`)
      
      if (isNative()) {
        // 原生平台：使用Capacitor Motion API
        await this.startNative()
      } else {
        // Web平台：使用浏览器DeviceMotion API
        await this.startWeb()
      }

      this.isActive = true
      log('✅', 'IMU sensors started successfully')
    } catch (error) {
      log('❌', 'Failed to start IMU sensors', error)
      throw error
    }
  }

  /**
   * 启动原生平台的IMU传感器
   */
  async startNative() {
    log('📱', 'Starting native platform IMU sensors...')
    
    // 请求传感器权限
    const permission = await Motion.requestPermission()
    log('✅', 'IMU permission granted', permission)

    // 监听加速度计和陀螺仪数据
    this.listener = await Motion.addListener('accel', (event) => {
      const dataPoint = {
        timestamp: Date.now(),
        acceleration: event.acceleration,
        accelerationIncludingGravity: event.accelerationIncludingGravity,
        rotationRate: event.rotationRate,
        interval: event.interval
      }

      this.data.push(dataPoint)
      
      // 限制数据点数量，避免内存溢出
      if (this.data.length > this.maxDataPoints) {
        this.data.shift()
      }

      // 定期打印日志（每100个数据点）
      if (this.data.length % 100 === 0) {
        log('📊', `IMU data collected: ${this.data.length} points`)
      }
    })
  }

  /**
   * 启动Web平台的IMU传感器（使用浏览器DeviceMotion API）
   */
  async startWeb() {
    log('🌐', 'Starting web platform IMU sensors...')
    
    // 检查浏览器是否支持DeviceMotion API
    if (typeof window === 'undefined' || !window.DeviceMotionEvent) {
      log('⚠️', 'DeviceMotion API not supported in this browser')
      // 创建模拟数据以便测试
      this.startSimulated()
      return
    }

    // iOS 13+需要请求权限
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceMotionEvent.requestPermission()
        if (permission !== 'granted') {
          log('⚠️', 'DeviceMotion permission denied, using simulated data')
          this.startSimulated()
          return
        }
        log('✅', 'DeviceMotion permission granted')
      } catch (error) {
        log('⚠️', 'Error requesting DeviceMotion permission', error)
        this.startSimulated()
        return
      }
    }

    // 监听devicemotion事件
    this.webMotionHandler = (event) => {
      const dataPoint = {
        timestamp: Date.now(),
        acceleration: event.acceleration ? {
          x: event.acceleration.x,
          y: event.acceleration.y,
          z: event.acceleration.z
        } : null,
        accelerationIncludingGravity: event.accelerationIncludingGravity ? {
          x: event.accelerationIncludingGravity.x,
          y: event.accelerationIncludingGravity.y,
          z: event.accelerationIncludingGravity.z
        } : null,
        rotationRate: event.rotationRate ? {
          alpha: event.rotationRate.alpha,
          beta: event.rotationRate.beta,
          gamma: event.rotationRate.gamma
        } : null,
        interval: event.interval
      }

      this.data.push(dataPoint)
      
      // 限制数据点数量，避免内存溢出
      if (this.data.length > this.maxDataPoints) {
        this.data.shift()
      }

      // 定期打印日志（每100个数据点）
      if (this.data.length % 100 === 0) {
        log('📊', `IMU data collected: ${this.data.length} points`)
      }
    }

    window.addEventListener('devicemotion', this.webMotionHandler)
    log('✅', 'Web DeviceMotion listener added')
  }

  /**
   * 启动模拟数据（用于不支持DeviceMotion的浏览器）
   */
  startSimulated() {
    log('🎭', 'Starting simulated IMU data for testing...')
    
    // 创建一个定时器来生成模拟数据
    this.listener = setInterval(() => {
      const dataPoint = {
        timestamp: Date.now(),
        acceleration: {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
          z: 9.8 + (Math.random() - 0.5) * 0.2
        },
        accelerationIncludingGravity: {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: 9.8 + (Math.random() - 0.5) * 0.5
        },
        rotationRate: {
          alpha: (Math.random() - 0.5) * 2,
          beta: (Math.random() - 0.5) * 2,
          gamma: (Math.random() - 0.5) * 2
        },
        interval: 100
      }

      this.data.push(dataPoint)
      
      // 限制数据点数量
      if (this.data.length > this.maxDataPoints) {
        this.data.shift()
      }

      // 定期打印日志（每50个数据点）
      if (this.data.length % 50 === 0) {
        log('📊', `Simulated IMU data collected: ${this.data.length} points`)
      }
    }, 100) // 每100ms生成一个数据点
  }

  async stop() {
    if (!this.isActive) {
      return
    }

    try {
      log('🛑', 'Stopping IMU sensors...')
      
      if (isNative()) {
        // 停止原生平台的监听器
        if (this.listener) {
          await this.listener.remove()
          this.listener = null
        }
      } else {
        // 停止Web平台的监听器
        if (this.webMotionHandler && typeof window !== 'undefined') {
          window.removeEventListener('devicemotion', this.webMotionHandler)
          this.webMotionHandler = null
        }
        
        // 如果使用的是模拟数据，清除定时器
        if (this.listener && typeof this.listener === 'number') {
          clearInterval(this.listener)
          this.listener = null
        }
      }

      this.isActive = false
      log('✅', `IMU sensors stopped. Collected ${this.data.length} data points`)
    } catch (error) {
      log('❌', 'Failed to stop IMU sensors', error)
      throw error
    }
  }

  getData() {
    return [...this.data]
  }

  clearData() {
    const count = this.data.length
    this.data = []
    log('🗑️', `Cleared ${count} IMU data points`)
  }

  getLatestData(count = 10) {
    return this.data.slice(-count)
  }

  // 分析设备姿态变化
  analyzeDeviceMotion() {
    if (this.data.length < 10) {
      return { stable: true, movement: 'minimal' }
    }

    const recent = this.getLatestData(20)
    
    // 计算加速度变化幅度
    const avgAccel = recent.reduce((sum, point) => {
      if (!point.acceleration) return sum
      const magnitude = Math.sqrt(
        Math.pow(point.acceleration.x || 0, 2) +
        Math.pow(point.acceleration.y || 0, 2) +
        Math.pow(point.acceleration.z || 0, 2)
      )
      return sum + magnitude
    }, 0) / recent.length

    const analysis = {
      stable: avgAccel < 2.0,
      movement: avgAccel < 1.0 ? 'minimal' : avgAccel < 5.0 ? 'moderate' : 'active',
      averageAcceleration: avgAccel,
      dataPoints: this.data.length
    }

    log('🔍', 'Device motion analysis', analysis)
    return analysis
  }
}

/**
 * 相机流管理器
 */
class CameraStreamManager {
  constructor() {
    this.frontStream = null
    this.rearStream = null
    this.capturedFrames = []
  }

  /**
   * 捕获照片（用于关键帧提取）
   */
  async capturePhoto(source = 'REAR') {
    try {
      log('📸', `Capturing photo from ${source} camera...`)
      
      const cameraSource = source === 'FRONT' ? CameraSource.Camera : CameraSource.Camera
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: cameraSource
      })

      const frame = {
        timestamp: Date.now(),
        source: source,
        format: image.format,
        base64: image.base64String,
        width: image.width,
        height: image.height
      }

      this.capturedFrames.push(frame)
      log('✅', `Photo captured from ${source} camera`, {
        width: frame.width,
        height: frame.height,
        format: frame.format
      })

      return frame
    } catch (error) {
      log('❌', `Failed to capture photo from ${source} camera`, error)
      throw error
    }
  }

  /**
   * 获取权限
   */
  async requestPermissions() {
    try {
      log('🔐', `Requesting camera permissions on ${platform}...`)
      
      if (isNative()) {
        // 原生平台使用Capacitor Camera API
        const permissions = await Camera.checkPermissions()
        
        if (permissions.camera !== 'granted' || permissions.photos !== 'granted') {
          const result = await Camera.requestPermissions()
          log('✅', 'Camera permissions result', result)
          return result
        }
        
        log('✅', 'Camera permissions already granted')
        return permissions
      } else {
        // Web平台：检查浏览器的MediaDevices API
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          log('⚠️', 'Camera API not supported in this browser')
          return { camera: 'denied', photos: 'denied' }
        }
        
        try {
          // 请求摄像头权限（通过尝试访问）
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
          })
          
          // 立即停止流，我们只是测试权限
          stream.getTracks().forEach(track => track.stop())
          
          log('✅', 'Camera permissions granted on web')
          return { camera: 'granted', photos: 'granted' }
        } catch (error) {
          log('⚠️', 'Camera permissions denied on web', error)
          return { camera: 'denied', photos: 'denied' }
        }
      }
    } catch (error) {
      log('❌', 'Failed to get camera permissions', error)
      throw error
    }
  }

  getFrames() {
    return [...this.capturedFrames]
  }

  clearFrames() {
    const count = this.capturedFrames.length
    this.capturedFrames = []
    log('🗑️', `Cleared ${count} captured frames`)
  }
}

/**
 * 应用状态监控器
 */
class AppStateMonitor {
  constructor() {
    this.stateHistory = []
    this.currentState = 'active'
    this.listener = null
  }

  async start() {
    try {
      log('🚀', 'Starting app state monitor...')
      
      // 获取设备信息
      const info = await Device.getInfo()
      log('📱', 'Device info', info)

      // 记录初始状态
      this.recordState('active', 'App started')
      
      // 在Web环境中监听visibility change
      if (typeof document !== 'undefined') {
        this.listener = () => {
          const state = document.hidden ? 'background' : 'active'
          this.recordState(state, 'Visibility changed')
        }
        document.addEventListener('visibilitychange', this.listener)
      }

      log('✅', 'App state monitor started')
    } catch (error) {
      log('❌', 'Failed to start app state monitor', error)
      throw error
    }
  }

  stop() {
    if (this.listener && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.listener)
      this.listener = null
    }
    log('🛑', 'App state monitor stopped')
  }

  recordState(state, reason = '') {
    const record = {
      timestamp: Date.now(),
      state: state,
      reason: reason,
      previousState: this.currentState
    }

    this.stateHistory.push(record)
    this.currentState = state

    log('📝', `App state changed: ${record.previousState} → ${state}`, { reason })
  }

  getStateHistory() {
    return [...this.stateHistory]
  }

  // 分析注意力分散情况
  analyzeDistraction() {
    if (this.stateHistory.length < 2) {
      return { distracted: false, switches: 0 }
    }

    const backgroundSwitches = this.stateHistory.filter(
      record => record.state === 'background'
    ).length

    const analysis = {
      distracted: backgroundSwitches > 3,
      switches: backgroundSwitches,
      currentState: this.currentState,
      totalRecords: this.stateHistory.length
    }

    log('🔍', 'Distraction analysis', analysis)
    return analysis
  }
}

/**
 * 音频录制管理器（占位符）
 * 注意：Web环境使用MediaRecorder API，需要在实际使用时实现
 */
class AudioRecorder {
  constructor() {
    this.isRecording = false
    this.mediaRecorder = null
    this.audioChunks = []
    this.stream = null
  }

  async start() {
    try {
      log('🚀', 'Starting audio recording...')
      
      // 请求麦克风权限
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
          log('📊', `Audio chunk received: ${event.data.size} bytes`)
        }
      }

      this.mediaRecorder.onstop = () => {
        log('✅', `Audio recording stopped. Total chunks: ${this.audioChunks.length}`)
      }

      this.mediaRecorder.start(1000) // 每秒一个chunk
      this.isRecording = true
      
      log('✅', 'Audio recording started')
    } catch (error) {
      log('❌', 'Failed to start audio recording', error)
      throw error
    }
  }

  stop() {
    if (!this.isRecording) {
      return null
    }

    try {
      log('🛑', 'Stopping audio recording...')
      
      this.mediaRecorder.stop()
      
      // 停止所有音频轨道
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop())
      }

      this.isRecording = false
      
      // 创建音频blob
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
      log('✅', `Audio blob created: ${audioBlob.size} bytes`)
      
      return audioBlob
    } catch (error) {
      log('❌', 'Failed to stop audio recording', error)
      throw error
    }
  }

  clearChunks() {
    this.audioChunks = []
    log('🗑️', 'Audio chunks cleared')
  }
}

/**
 * 统一的传感器管理器
 */
export class SensorManager {
  constructor() {
    this.imu = new IMUSensorManager()
    this.camera = new CameraStreamManager()
    this.appState = new AppStateMonitor()
    this.audio = new AudioRecorder()
    this.isActive = false
  }

  /**
   * 启动所有传感器
   */
  async startAll() {
    const results = {
      success: false,
      platform: platform,
      isNative: isNative(),
      sensors: {
        imu: false,
        camera: false,
        appState: false,
        audio: false
      },
      errors: []
    }

    try {
      log('🚀', '='.repeat(60))
      log('🚀', 'Starting all sensors...')
      log('📱', `Platform: ${platform} (${isNative() ? 'Native' : 'Web'})`)
      log('🚀', '='.repeat(60))
      
      // 启动IMU传感器（必需）
      try {
        await this.imu.start()
        results.sensors.imu = true
      } catch (error) {
        log('⚠️', 'IMU sensor failed to start, using simulated data', error)
        results.errors.push({ sensor: 'imu', error: error.message })
        // IMU是核心传感器，但我们有模拟数据作为后备
        results.sensors.imu = true
      }
      
      // 启动应用状态监控（必需）
      try {
        await this.appState.start()
        results.sensors.appState = true
      } catch (error) {
        log('⚠️', 'App state monitor failed to start', error)
        results.errors.push({ sensor: 'appState', error: error.message })
      }
      
      // 请求相机权限（可选）
      try {
        await this.camera.requestPermissions()
        results.sensors.camera = true
      } catch (error) {
        log('⚠️', 'Camera permissions not available (optional)', error)
        results.errors.push({ sensor: 'camera', error: error.message })
      }
      
      // 启动音频录制（可选）
      try {
        await this.audio.start()
        results.sensors.audio = true
      } catch (error) {
        log('⚠️', 'Audio recording not available (optional)', error)
        results.errors.push({ sensor: 'audio', error: error.message })
      }
      
      this.isActive = true
      results.success = true
      
      log('✅', '='.repeat(60))
      log('✅', `Sensors started: IMU=${results.sensors.imu}, Camera=${results.sensors.camera}, Audio=${results.sensors.audio}, AppState=${results.sensors.appState}`)
      if (results.errors.length > 0) {
        log('⚠️', `Some sensors unavailable (${results.errors.length} errors)`, results.errors)
      }
      log('✅', '='.repeat(60))
      
      return results
    } catch (error) {
      log('❌', 'Failed to start sensors', error)
      results.errors.push({ sensor: 'system', error: error.message })
      throw error
    }
  }

  /**
   * 停止所有传感器
   */
  async stopAll() {
    try {
      log('🛑', '='.repeat(60))
      log('🛑', 'Stopping all sensors...')
      log('🛑', '='.repeat(60))
      
      await this.imu.stop()
      this.appState.stop()
      const audioBlob = this.audio.stop()
      
      this.isActive = false
      
      log('✅', 'All sensors stopped')
      
      return {
        success: true,
        audioBlob: audioBlob
      }
    } catch (error) {
      log('❌', 'Failed to stop all sensors', error)
      throw error
    }
  }

  /**
   * 收集所有传感器数据
   */
  async collectAllData() {
    try {
      log('📦', 'Collecting all sensor data...')
      
      const data = {
        timestamp: Date.now(),
        imu: {
          data: this.imu.getData(),
          analysis: this.imu.analyzeDeviceMotion()
        },
        camera: {
          frames: this.camera.getFrames()
        },
        appState: {
          history: this.appState.getStateHistory(),
          analysis: this.appState.analyzeDistraction()
        }
      }
      
      log('✅', 'All sensor data collected', {
        imuPoints: data.imu.data.length,
        frames: data.camera.frames.length,
        stateRecords: data.appState.history.length
      })
      
      return data
    } catch (error) {
      log('❌', 'Failed to collect sensor data', error)
      throw error
    }
  }

  /**
   * 捕获当前帧（用于关键帧提取）
   */
  async captureKeyframe(source = 'REAR') {
    return await this.camera.capturePhoto(source)
  }

  /**
   * 清除所有数据
   */
  clearAllData() {
    this.imu.clearData()
    this.camera.clearFrames()
    this.audio.clearChunks()
    log('✅', 'All sensor data cleared')
  }
}

// 创建单例实例
export const sensorManager = new SensorManager()
