/**
 * VisiSec WebSocket Service
 * 实时双向通信服务
 * 
 * 功能：
 * - 实时传输传感器数据
 * - 接收后端处理结果
 * - 自动重连机制
 */

// 日志辅助函数
const log = (emoji, message, data = null) => {
  console.log(`${emoji} [WebSocket] ${message}`)
  if (data) {
    console.log('   📊 Data:', data)
  }
}

/**
 * WebSocket连接管理器
 */
export class WebSocketManager {
  constructor(url) {
    this.url = url || this.getWebSocketURL()
    this.ws = null
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 2000
    this.messageHandlers = new Map()
    this.eventHandlers = new Map()
  }

  /**
   * 获取WebSocket URL
   */
  getWebSocketURL() {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5124'
    // 将 http:// 替换为 ws://, https:// 替换为 wss://
    return apiUrl.replace(/^http/, 'ws') + '/ws'
  }

  /**
   * 连接到服务器
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        log('🔌', `Connecting to ${this.url}...`)
        
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          this.isConnected = true
          this.reconnectAttempts = 0
          log('✅', 'WebSocket connected successfully')
          
          // 触发连接事件
          this.triggerEvent('connected')
          
          resolve()
        }

        this.ws.onclose = (event) => {
          this.isConnected = false
          log('🔌', 'WebSocket connection closed', {
            code: event.code,
            reason: event.reason
          })
          
          // 触发断开事件
          this.triggerEvent('disconnected', { code: event.code, reason: event.reason })
          
          // 自动重连
          this.attemptReconnect()
        }

        this.ws.onerror = (error) => {
          log('❌', 'WebSocket error', error)
          
          // 触发错误事件
          this.triggerEvent('error', error)
          
          reject(error)
        }

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data)
        }

      } catch (error) {
        log('❌', 'Failed to create WebSocket connection', error)
        reject(error)
      }
    })
  }

  /**
   * 尝试重连
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      log('❌', `Max reconnect attempts (${this.maxReconnectAttempts}) reached`)
      this.triggerEvent('reconnect_failed')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * this.reconnectAttempts

    log('🔄', `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    
    setTimeout(() => {
      this.connect().catch(error => {
        log('❌', 'Reconnection failed', error)
      })
    }, delay)
  }

  /**
   * 发送消息
   */
  send(type, data) {
    if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      log('⚠️', 'Cannot send message - not connected')
      throw new Error('WebSocket is not connected')
    }

    try {
      const message = JSON.stringify({
        type: type,
        data: data,
        timestamp: Date.now()
      })

      this.ws.send(message)
      log('📤', `Message sent: ${type}`, data)
    } catch (error) {
      log('❌', 'Failed to send message', error)
      throw error
    }
  }

  /**
   * 处理接收到的消息
   */
  handleMessage(rawData) {
    try {
      const message = JSON.parse(rawData)
      log('📥', `Message received: ${message.type}`, message.data)
      
      // 触发特定类型的处理器
      if (this.messageHandlers.has(message.type)) {
        const handler = this.messageHandlers.get(message.type)
        handler(message.data)
      }
      
      // 触发通用消息事件
      this.triggerEvent('message', message)
      
    } catch (error) {
      log('❌', 'Failed to handle message', error)
    }
  }

  /**
   * 注册消息处理器
   */
  on(type, handler) {
    if (typeof handler !== 'function') {
      throw new Error('Handler must be a function')
    }

    this.messageHandlers.set(type, handler)
    log('📝', `Message handler registered for type: ${type}`)
  }

  /**
   * 注册事件处理器
   */
  onEvent(event, handler) {
    if (typeof handler !== 'function') {
      throw new Error('Handler must be a function')
    }

    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }

    this.eventHandlers.get(event).push(handler)
    log('📝', `Event handler registered for: ${event}`)
  }

  /**
   * 触发事件
   */
  triggerEvent(event, data = null) {
    if (this.eventHandlers.has(event)) {
      const handlers = this.eventHandlers.get(event)
      handlers.forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          log('❌', `Error in event handler for ${event}`, error)
        }
      })
    }
  }

  /**
   * 移除消息处理器
   */
  off(type) {
    if (this.messageHandlers.has(type)) {
      this.messageHandlers.delete(type)
      log('🗑️', `Message handler removed for type: ${type}`)
    }
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.ws) {
      log('🔌', 'Disconnecting WebSocket...')
      this.ws.close()
      this.ws = null
      this.isConnected = false
      log('✅', 'WebSocket disconnected')
    }
  }

  /**
   * 获取连接状态
   */
  getStatus() {
    return {
      connected: this.isConnected,
      readyState: this.ws?.readyState,
      reconnectAttempts: this.reconnectAttempts,
      url: this.url
    }
  }
}

/**
 * VisiSec专用WebSocket客户端
 */
export class VisiSecWebSocket {
  constructor() {
    this.wsManager = new WebSocketManager()
    this.sessionId = null
    this.recordingId = null
  }

  /**
   * 启动会议会话
   */
  async startSession(meetingTitle) {
    try {
      log('🚀', 'Starting meeting session...', { meetingTitle })
      
      // 连接WebSocket
      if (!this.wsManager.isConnected) {
        await this.wsManager.connect()
      }

      // 发送会话开始消息
      this.wsManager.send('session_start', {
        meetingTitle: meetingTitle,
        timestamp: Date.now()
      })

      // 等待会话ID响应
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Session start timeout'))
        }, 5000)

        this.wsManager.on('session_started', (data) => {
          clearTimeout(timeout)
          this.sessionId = data.sessionId
          this.recordingId = data.recordingId
          log('✅', 'Session started', data)
          resolve(data)
        })
      })
    } catch (error) {
      log('❌', 'Failed to start session', error)
      throw error
    }
  }

  /**
   * 发送传感器数据
   */
  sendSensorData(sensorData) {
    if (!this.sessionId) {
      log('⚠️', 'No active session - cannot send sensor data')
      return
    }

    try {
      this.wsManager.send('sensor_data', {
        sessionId: this.sessionId,
        ...sensorData
      })
    } catch (error) {
      log('❌', 'Failed to send sensor data', error)
      throw error
    }
  }

  /**
   * 发送关键帧
   */
  sendKeyframe(frameData) {
    if (!this.sessionId) {
      log('⚠️', 'No active session - cannot send keyframe')
      return
    }

    try {
      this.wsManager.send('keyframe', {
        sessionId: this.sessionId,
        recordingId: this.recordingId,
        ...frameData
      })
    } catch (error) {
      log('❌', 'Failed to send keyframe', error)
      throw error
    }
  }

  /**
   * 结束会话
   */
  async endSession() {
    if (!this.sessionId) {
      log('⚠️', 'No active session to end')
      return
    }

    try {
      log('🛑', 'Ending session...')
      
      this.wsManager.send('session_end', {
        sessionId: this.sessionId,
        recordingId: this.recordingId,
        timestamp: Date.now()
      })

      // 等待确认
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Session end timeout'))
        }, 5000)

        this.wsManager.on('session_ended', (data) => {
          clearTimeout(timeout)
          log('✅', 'Session ended', data)
          
          this.sessionId = null
          this.recordingId = null
          
          resolve(data)
        })
      })
    } catch (error) {
      log('❌', 'Failed to end session', error)
      throw error
    }
  }

  /**
   * 注册结果处理器
   */
  onAnalysisResult(handler) {
    this.wsManager.on('analysis_result', handler)
  }

  onSummaryUpdate(handler) {
    this.wsManager.on('summary_update', handler)
  }

  onError(handler) {
    this.wsManager.onEvent('error', handler)
  }

  /**
   * 断开连接
   */
  disconnect() {
    this.wsManager.disconnect()
    this.sessionId = null
    this.recordingId = null
  }

  /**
   * 获取连接状态
   */
  getStatus() {
    return {
      ...this.wsManager.getStatus(),
      sessionId: this.sessionId,
      recordingId: this.recordingId,
      hasActiveSession: !!this.sessionId
    }
  }
}

// 创建单例实例
export const wsClient = new VisiSecWebSocket()
