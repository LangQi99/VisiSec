/**
 * VisiSec Edge Model Service
 * 端侧轻量级模型推理服务
 * 
 * 功能：
 * - 场景变化检测
 * - 关键帧提取
 * - 注意力分析
 */

import * as tf from '@tensorflow/tfjs'

// 日志辅助函数
const log = (emoji, message, data = null) => {
  console.log(`${emoji} [EdgeModel] ${message}`)
  if (data) {
    console.log('   📊 Data:', data)
  }
}

/**
 * 场景变化检测器
 * 使用简单的图像差异算法检测PPT翻页、白板更新等
 */
export class SceneChangeDetector {
  constructor() {
    this.previousFrame = null
    this.threshold = 0.15 // 变化阈值（15%）
    this.initialized = false
  }

  /**
   * 初始化检测器
   */
  async initialize() {
    try {
      log('🚀', 'Initializing scene change detector...')
      
      // 确保TensorFlow.js已就绪
      await tf.ready()
      
      log('✅', 'TensorFlow.js backend:', tf.getBackend())
      log('✅', 'Scene change detector initialized')
      
      this.initialized = true
      return true
    } catch (error) {
      log('❌', 'Failed to initialize scene change detector', error)
      throw error
    }
  }

  /**
   * 将base64图像转换为tensor
   */
  async imageToTensor(base64Image) {
    try {
      // 创建Image元素
      const img = new Image()
      img.src = `data:image/jpeg;base64,${base64Image}`
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })

      // 转换为tensor并调整大小
      const tensor = tf.browser.fromPixels(img)
        .resizeNearestNeighbor([224, 224]) // 统一尺寸
        .toFloat()
        .div(255.0) // 归一化到 [0, 1]
      
      return tensor
    } catch (error) {
      log('❌', 'Failed to convert image to tensor', error)
      throw error
    }
  }

  /**
   * 检测场景变化
   * @param {string} base64Image - Base64编码的图像
   * @returns {Object} 检测结果
   */
  async detectChange(base64Image) {
    if (!this.initialized) {
      await this.initialize()
    }

    try {
      log('🔍', 'Detecting scene change...')
      
      const currentTensor = await this.imageToTensor(base64Image)

      // 第一帧，保存为参考
      if (!this.previousFrame) {
        this.previousFrame = currentTensor
        log('📸', 'First frame captured as reference')
        return {
          changed: false,
          changeRatio: 0,
          isKeyframe: false
        }
      }

      // 计算图像差异
      const diff = tf.tidy(() => {
        const difference = tf.sub(currentTensor, this.previousFrame)
        const absoluteDiff = tf.abs(difference)
        const meanDiff = tf.mean(absoluteDiff)
        return meanDiff.dataSync()[0]
      })

      const changed = diff > this.threshold
      const isKeyframe = diff > this.threshold * 2 // 更明显的变化才算关键帧

      log('✅', `Scene change detection complete`, {
        changeRatio: diff.toFixed(4),
        threshold: this.threshold,
        changed: changed,
        isKeyframe: isKeyframe
      })

      // 如果检测到变化，更新参考帧
      if (changed) {
        this.previousFrame.dispose() // 释放旧tensor
        this.previousFrame = currentTensor
      } else {
        currentTensor.dispose() // 释放当前tensor
      }

      return {
        changed: changed,
        changeRatio: diff,
        isKeyframe: isKeyframe,
        timestamp: Date.now()
      }
    } catch (error) {
      log('❌', 'Scene change detection failed', error)
      throw error
    }
  }

  /**
   * 重置检测器
   */
  reset() {
    if (this.previousFrame) {
      this.previousFrame.dispose()
      this.previousFrame = null
    }
    log('🔄', 'Scene change detector reset')
  }

  /**
   * 清理资源
   */
  dispose() {
    this.reset()
    log('🗑️', 'Scene change detector disposed')
  }
}

/**
 * 简化的注意力评分器
 * 基于IMU数据和应用状态评估用户注意力
 */
export class AttentionScorer {
  constructor() {
    this.initialized = false
  }

  async initialize() {
    try {
      log('🚀', 'Initializing attention scorer...')
      this.initialized = true
      log('✅', 'Attention scorer initialized')
      return true
    } catch (error) {
      log('❌', 'Failed to initialize attention scorer', error)
      throw error
    }
  }

  /**
   * 计算注意力得分
   * @param {Object} sensorData - 传感器数据
   * @returns {Object} 注意力分析结果
   */
  async scoreAttention(sensorData) {
    if (!this.initialized) {
      await this.initialize()
    }

    try {
      log('🧠', 'Calculating attention score...')
      
      // 基础得分
      let score = 1.0

      // 根据设备运动调整得分
      if (sensorData.imu && sensorData.imu.analysis) {
        const motion = sensorData.imu.analysis
        
        if (motion.movement === 'active') {
          score -= 0.3 // 设备频繁移动，可能分心
          log('📉', 'Score reduced due to active device movement')
        } else if (motion.movement === 'moderate') {
          score -= 0.1
        }
      }

      // 根据应用状态调整得分
      if (sensorData.appState && sensorData.appState.analysis) {
        const distraction = sensorData.appState.analysis
        
        if (distraction.distracted) {
          score -= 0.4 // 频繁切换应用，注意力分散
          log('📉', 'Score reduced due to app switching')
        }
        
        if (distraction.currentState === 'background') {
          score -= 0.5 // 应用在后台
          log('📉', 'Score reduced - app in background')
        }
      }

      // 确保得分在 [0, 1] 范围内
      score = Math.max(0, Math.min(1, score))

      const level = score > 0.7 ? 'high' : score > 0.4 ? 'medium' : 'low'
      const color = level === 'high' ? 'green' : level === 'medium' ? 'yellow' : 'red'

      const result = {
        score: score,
        level: level,
        color: color,
        timestamp: Date.now(),
        factors: {
          deviceMotion: sensorData.imu?.analysis?.movement || 'unknown',
          appState: sensorData.appState?.analysis?.currentState || 'unknown',
          distracted: sensorData.appState?.analysis?.distracted || false
        }
      }

      log('✅', 'Attention score calculated', result)
      
      return result
    } catch (error) {
      log('❌', 'Failed to calculate attention score', error)
      throw error
    }
  }

  /**
   * 批量处理注意力数据，生成时间线
   */
  async generateAttentionTimeline(sensorDataArray) {
    try {
      log('📊', `Generating attention timeline for ${sensorDataArray.length} data points...`)
      
      const timeline = []
      
      for (const data of sensorDataArray) {
        const score = await this.scoreAttention(data)
        timeline.push(score)
      }

      // 识别低注意力时段
      const lowAttentionPeriods = []
      let periodStart = null

      for (let i = 0; i < timeline.length; i++) {
        if (timeline[i].level === 'low') {
          if (periodStart === null) {
            periodStart = i
          }
        } else {
          if (periodStart !== null) {
            lowAttentionPeriods.push({
              start: periodStart,
              end: i - 1,
              duration: i - periodStart
            })
            periodStart = null
          }
        }
      }

      // 处理结尾的低注意力时段
      if (periodStart !== null) {
        lowAttentionPeriods.push({
          start: periodStart,
          end: timeline.length - 1,
          duration: timeline.length - periodStart
        })
      }

      const result = {
        timeline: timeline,
        lowAttentionPeriods: lowAttentionPeriods,
        averageScore: timeline.reduce((sum, item) => sum + item.score, 0) / timeline.length
      }

      log('✅', 'Attention timeline generated', {
        dataPoints: timeline.length,
        lowPeriods: lowAttentionPeriods.length,
        avgScore: result.averageScore.toFixed(2)
      })

      return result
    } catch (error) {
      log('❌', 'Failed to generate attention timeline', error)
      throw error
    }
  }
}

/**
 * OCR模拟器（占位符）
 * 实际应用中可以使用Tesseract.js或其他OCR库
 */
export class SimpleOCR {
  constructor() {
    this.initialized = false
  }

  async initialize() {
    try {
      log('🚀', 'Initializing OCR...')
      // 这里可以加载Tesseract.js或其他OCR引擎
      this.initialized = true
      log('✅', 'OCR initialized (placeholder)')
      return true
    } catch (error) {
      log('❌', 'Failed to initialize OCR', error)
      throw error
    }
  }

  /**
   * 从图像中提取文本
   */
  async extractText(base64Image) {
    if (!this.initialized) {
      await this.initialize()
    }

    try {
      log('🔍', 'Extracting text from image...')
      
      // 占位符实现
      // 实际应用中应该使用真实的OCR引擎
      const mockText = `
检测到的文本（模拟）:
• 产品路线图 Q4 2026
• 核心功能优先级
• 市场分析结果
• 下一步行动计划
      `.trim()

      log('✅', 'Text extraction complete (simulated)')
      
      return {
        text: mockText,
        confidence: 0.85,
        timestamp: Date.now()
      }
    } catch (error) {
      log('❌', 'Failed to extract text', error)
      throw error
    }
  }
}

/**
 * 边缘模型管理器
 * 统一管理所有端侧模型
 */
export class EdgeModelManager {
  constructor() {
    this.sceneDetector = new SceneChangeDetector()
    this.attentionScorer = new AttentionScorer()
    this.ocr = new SimpleOCR()
    this.initialized = false
  }

  /**
   * 初始化所有模型
   */
  async initializeAll() {
    try {
      log('🚀', '='.repeat(60))
      log('🚀', 'Initializing all edge models...')
      log('🚀', '='.repeat(60))
      
      await this.sceneDetector.initialize()
      await this.attentionScorer.initialize()
      await this.ocr.initialize()
      
      this.initialized = true
      
      log('✅', '='.repeat(60))
      log('✅', 'All edge models initialized successfully!')
      log('✅', '='.repeat(60))
      
      return {
        success: true,
        models: {
          sceneDetector: true,
          attentionScorer: true,
          ocr: true
        },
        backend: tf.getBackend()
      }
    } catch (error) {
      log('❌', 'Failed to initialize edge models', error)
      throw error
    }
  }

  /**
   * 处理单帧
   */
  async processFrame(base64Image, sensorData) {
    if (!this.initialized) {
      await this.initializeAll()
    }

    try {
      log('⚙️', 'Processing frame...')
      
      // 并行处理
      const [sceneChange, attentionScore, ocrResult] = await Promise.all([
        this.sceneDetector.detectChange(base64Image),
        this.attentionScorer.scoreAttention(sensorData),
        sceneChange?.isKeyframe ? this.ocr.extractText(base64Image) : null
      ])

      const result = {
        timestamp: Date.now(),
        sceneChange: sceneChange,
        attention: attentionScore,
        ocr: ocrResult,
        isKeyframe: sceneChange.isKeyframe
      }

      log('✅', 'Frame processing complete', {
        sceneChanged: sceneChange.changed,
        attentionLevel: attentionScore.level,
        isKeyframe: result.isKeyframe
      })

      return result
    } catch (error) {
      log('❌', 'Failed to process frame', error)
      throw error
    }
  }

  /**
   * 清理资源
   */
  dispose() {
    this.sceneDetector.dispose()
    log('🗑️', 'Edge model manager disposed')
  }
}

// 创建单例实例
export const edgeModelManager = new EdgeModelManager()
