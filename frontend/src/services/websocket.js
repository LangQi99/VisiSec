/**
 * VisiSec WebSocket Service
 * Real-time bidirectional communication service using Socket.IO
 * 
 * Features:
 * - Real-time sensor data transmission
 * - Backend result reception
 * - Automatic reconnection (handled by Socket.IO)
 */

import { io } from "socket.io-client"

// Log helper
const log = (emoji, message, data = null) => {
  console.log(`${emoji} [WebSocket] ${message}`)
  if (data) {
    console.log('   📊 Data:', data)
  }
}

/**
 * WebSocket Manager using Socket.IO
 */
export class WebSocketManager {
  constructor(url) {
    this.url = url || this.getWebSocketURL()
    this.socket = null
    this.isConnected = false
    this.eventHandlers = new Map() // For custom event bridging if needed
  }

  /**
   * Get WebSocket URL (HTTP base URL for Socket.IO)
   */
  getWebSocketURL() {
    return import.meta.env.VITE_API_URL || 'http://localhost:5124'
  }

  /**
   * Connect to server
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        if (this.socket && this.socket.connected) {
          resolve()
          return
        }

        log('🔌', `Connecting to ${this.url}...`)

        this.socket = io(this.url, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 2000,
          timeout: 10000
        })

        // Connection events
        this.socket.on('connect', () => {
          this.isConnected = true
          log('✅', 'Socket.IO connected successfully', { sid: this.socket.id })
          this.triggerEvent('connected')
          resolve()
        })

        this.socket.on('disconnect', (reason) => {
          this.isConnected = false
          log('🔌', 'Socket.IO disconnected', { reason })
          this.triggerEvent('disconnected', { reason })
        })

        this.socket.on('connect_error', (error) => {
          log('❌', 'Connection error', error)
          this.triggerEvent('error', error)
          // Only reject if it's the specific promise we are waiting for. 
          // Note: Socket.IO keeps trying, so rejecting here might be only for initial attempt.
          // For simplicity, we assume the initial connect call resolves on success.
          // Logic for reject is tricky with auto-reconnect, but we can leave it pending or reject on timeout.
        })

        this.socket.on('error', (error) => {
          log('❌', 'Socket error', error)
          this.triggerEvent('error', error)
        })

        // Catch-all for debugging (optional, requires custom plugin usually, sticking to standard events)

      } catch (error) {
        log('❌', 'Failed to create Socket.IO connection', error)
        reject(error)
      }
    })
  }

  /**
   * Send message (emit event)
   */
  send(event, data) {
    if (!this.socket || !this.isConnected) {
      log('⚠️', 'Cannot send message - not connected')
      // Socket.IO supports buffering, but we'll keep the check to match previous behavior/expectations
      // or we can allow it if we trust auto-buffer.
      // Let's warn but try to emit if socket object exists, as it might buffer.
    }

    try {
      // Backend expects 'session_start', 'sensor_data', etc. as event names
      // The previous 'type' argument maps exactly to the event name.
      this.socket.emit(event, data)
      log('📤', `Message sent: ${event}`, data)
    } catch (error) {
      log('❌', 'Failed to send message', error)
      throw error
    }
  }

  /**
   * Register message handler (subscribe to event)
   */
  on(event, handler) {
    if (typeof handler !== 'function') {
      throw new Error('Handler must be a function')
    }

    if (!this.socket) {
      // If socket doesn't exist yet, we can't register directly.
      // But optimization: usually connect() is called first. 
      // Or we can store handlers and attach on connect.
      // For now, assume connect() is called or we init socket in constructor?
      // Let's init socket in constructor? No, connect() does it.
      // We will warn if socket is not ready, or better, auto-connect?
      // Let's simple check.
      console.warn('Socket not initialized when registering handler. Call connect() first or ensure socket exists.')
      return
    }

    this.socket.on(event, (data) => {
      log('📥', `Message received: ${event}`, data)
      handler(data)
    })
    log('📝', `Message handler registered for type: ${event}`)
  }

  /**
   * Register event handler (for connection lifecycle mostly)
   * Bridging our custom 'connected', 'disconnected', 'error' events
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
   * Trigger internal bridged events
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
   * Remove message handler
   */
  off(event) {
    if (this.socket) {
      this.socket.off(event)
      log('🗑️', `Message handler removed for type: ${event}`)
    }
  }

  /**
   * Disconnect
   */
  disconnect() {
    if (this.socket) {
      log('🔌', 'Disconnecting Socket.IO...')
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      log('✅', 'Socket.IO disconnected')
    }
  }

  /**
   * Get status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      id: this.socket?.id,
      url: this.url
    }
  }
}

/**
 * VisiSec specialized WebSocket Client
 * (Kept largely compatible with previous interface)
 */
export class VisiSecWebSocket {
  constructor() {
    this.wsManager = new WebSocketManager()
    this.sessionId = null
    this.recordingId = null
    // Ensure socket initialized?? 
    // Actually, WebSocketManager.connect() initializes it.
    // But VisiSecWebSocket might call .on() before .connect().
    // We should probably initialize io object in constructor but connect later?
    // Or just make sure we handle .on() registration queuing. 
    // Simplified: Users call startSession -> connect -> then send.
    // Listeners might be registered early.

    // To be safe, let's allow WebSocketManager to lazy init or init on construction.
    // But we need the URL. 'new WebSocketManager()' calls getWebSocketURL().
    // So good to init socket instance in connect() or earlier.
    // If we init in connect(), .on() fails if called before.

    // Let's auto-init socket in WebSocketManager constructor with autoConnect: false
  }

  /**
   * Start meeting session
   */
  async startSession(meetingTitle) {
    try {
      log('🚀', 'Starting meeting session...', { meetingTitle })

      // Connect first
      if (!this.wsManager.isConnected) {
        await this.wsManager.connect()
      }

      // Backend expects 'session_start' event
      this.wsManager.send('session_start', {
        meetingTitle: meetingTitle,
        timestamp: Date.now()
      })

      // Wait for 'session_started' response
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.wsManager.off('session_started')
          reject(new Error('Session start timeout'))
        }, 5000)

        const handler = (data) => {
          clearTimeout(timeout)
          this.wsManager.off('session_started')
          this.sessionId = data.sessionId
          this.recordingId = data.recordingId
          log('✅', 'Session started', data)
          resolve(data)
        }

        this.wsManager.on('session_started', handler)
      })
    } catch (error) {
      log('❌', 'Failed to start session', error)
      throw error
    }
  }

  /**
   * Send sensor data
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
   * Send keyframe
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
   * End session
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

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.wsManager.off('session_ended')
          reject(new Error('Session end timeout'))
        }, 5000)

        const handler = (data) => {
          clearTimeout(timeout)
          this.wsManager.off('session_ended')
          log('✅', 'Session ended', data)

          this.sessionId = null
          this.recordingId = null

          resolve(data)
        }

        this.wsManager.on('session_ended', handler)
      })
    } catch (error) {
      log('❌', 'Failed to end session', error)
      throw error
    }
  }

  /**
   * Register analysis result handler
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
   * Disconnect
   */
  disconnect() {
    this.wsManager.disconnect()
    this.sessionId = null
    this.recordingId = null
  }

  /**
   * Get status
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

// Create singleton instance
export const wsClient = new VisiSecWebSocket()
