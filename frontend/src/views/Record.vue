<template>
  <div class="max-w-4xl mx-auto">
    <div class="mb-8">
      <router-link to="/" class="text-terracotta hover:underline flex items-center space-x-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span>{{ t('record.backToHome') }}</span>
      </router-link>
    </div>

    <div class="card">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-serif font-bold text-ink mb-4">{{ t('record.title') }}</h1>
        <p class="text-gray-600">
          {{ t('record.subtitle') }}
        </p>
      </div>

      <!-- Recording Status -->
      <div class="bg-gray-50 rounded-2xl p-8 mb-6 text-center">
        <div class="flex justify-center mb-4">
          <div 
            :class="[
              'w-24 h-24 rounded-full flex items-center justify-center',
              isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'
            ]"
          >
            <svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="8" />
            </svg>
          </div>
        </div>
        
        <div class="text-5xl font-mono font-bold text-ink mb-2">
          {{ formattedTime }}
        </div>
        <div class="text-gray-500">
          {{ isRecording ? t('record.status.recording') : t('record.status.ready') }}
        </div>
      </div>

      <!-- Active Sensors -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div :class="[
          'border rounded-xl p-4 text-center',
          sensorStatus.audio ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
        ]">
          <svg class="w-8 h-8 mx-auto mb-2" :class="sensorStatus.audio ? 'text-green-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <div class="text-sm font-medium" :class="sensorStatus.audio ? 'text-green-900' : 'text-gray-600'">{{ t('record.sensors.audio') }}</div>
          <div class="text-xs" :class="sensorStatus.audio ? 'text-green-600' : 'text-gray-400'">
            {{ sensorStatus.audio ? t('record.sensors.active') : t('record.sensors.inactive') }}
          </div>
        </div>

        <div :class="[
          'border rounded-xl p-4 text-center',
          sensorStatus.camera ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
        ]">
          <svg class="w-8 h-8 mx-auto mb-2" :class="sensorStatus.camera ? 'text-green-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <div class="text-sm font-medium" :class="sensorStatus.camera ? 'text-green-900' : 'text-gray-600'">{{ t('record.sensors.frontCamera') }}</div>
          <div class="text-xs" :class="sensorStatus.camera ? 'text-green-600' : 'text-gray-400'">
            {{ sensorStatus.camera ? t('record.sensors.active') : t('record.sensors.inactive') }}
          </div>
        </div>

        <div :class="[
          'border rounded-xl p-4 text-center',
          sensorStatus.camera ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
        ]">
          <svg class="w-8 h-8 mx-auto mb-2" :class="sensorStatus.camera ? 'text-green-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div class="text-sm font-medium" :class="sensorStatus.camera ? 'text-green-900' : 'text-gray-600'">{{ t('record.sensors.rearCamera') }}</div>
          <div class="text-xs" :class="sensorStatus.camera ? 'text-green-600' : 'text-gray-400'">
            {{ sensorStatus.camera ? t('record.sensors.active') : t('record.sensors.inactive') }}
          </div>
        </div>

        <div :class="[
          'border rounded-xl p-4 text-center',
          sensorStatus.imu ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
        ]">
          <svg class="w-8 h-8 mx-auto mb-2" :class="sensorStatus.imu ? 'text-green-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <div class="text-sm font-medium" :class="sensorStatus.imu ? 'text-green-900' : 'text-gray-600'">{{ t('record.sensors.imu') }}</div>
          <div class="text-xs" :class="sensorStatus.imu ? 'text-green-600' : 'text-gray-400'">
            {{ sensorStatus.imu ? t('record.sensors.active') : t('record.sensors.inactive') }}
          </div>
        </div>
      </div>

      <!-- Meeting Info -->
      <div class="space-y-4 mb-8">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('record.info.titleLabel') }}</label>
          <input 
            v-model="meetingTitle"
            type="text" 
            class="input-field w-full"
            :placeholder="t('record.info.titlePlaceholder')"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('record.info.notesLabel') }}</label>
          <textarea 
            v-model="meetingNotes"
            class="input-field w-full"
            rows="3"
            :placeholder="t('record.info.notesPlaceholder')"
          ></textarea>
        </div>
      </div>

      <!-- Control Buttons -->
      <div class="flex justify-center space-x-4">
        <button 
          @click="toggleRecording"
          :class="[
            'px-8 py-4 rounded-full font-semibold text-lg transition-all',
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-ink hover:bg-gray-800 text-white'
          ]"
        >
          {{ isRecording ? t('record.actions.stop') : t('record.actions.start') }}
        </button>
        
        <button 
          v-if="isRecording"
          @click="pauseRecording"
          class="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full font-semibold text-lg transition-all"
        >
          {{ isPaused ? t('record.actions.resume') : t('record.actions.pause') }}
        </button>
      </div>

      <!-- API Status -->
      <div v-if="apiStatus" class="mt-6 p-4 rounded-lg" :class="apiStatus.success ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'">
        <p class="text-sm">{{ apiStatus.message }}</p>
      </div>
    </div>
    
    <!-- Meeting Type Selection Modal -->
    <div v-if="showMeetingTypeModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl">
        <h2 class="text-2xl font-serif font-bold text-ink mb-6 text-center">{{ t('record.meetingType.title') }}</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button 
            @click="confirmMeetingType('OFFLINE')"
            class="p-6 rounded-2xl border-2 border-transparent hover:border-terracotta bg-stone-50 hover:bg-orange-50 transition-all text-center group"
          >
            <div class="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <svg class="w-8 h-8 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 class="font-bold text-lg mb-1">{{ t('record.meetingType.offline') }}</h3>
            <p class="text-sm text-gray-500">{{ t('record.meetingType.offlineDesc') }}</p>
          </button>
          
          <button 
            @click="confirmMeetingType('ONLINE')"
            class="p-6 rounded-2xl border-2 border-transparent hover:border-terracotta bg-stone-50 hover:bg-orange-50 transition-all text-center group"
          >
            <div class="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <svg class="w-8 h-8 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="font-bold text-lg mb-1">{{ t('record.meetingType.online') }}</h3>
            <p class="text-sm text-gray-500">{{ t('record.meetingType.onlineDesc') }}</p>
          </button>
        </div>
        
        <button 
          @click="showMeetingTypeModal = false"
          class="w-full py-3 text-gray-500 hover:text-gray-800 font-medium"
        >
          {{ t('common.cancel') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { analyzeAttention } from '../services/api'
import { sensorManager } from '../services/sensors'
import { edgeModelManager } from '../services/edgeModels'
import { wsClient } from '../services/websocket'

const { t } = useI18n()
const router = useRouter()
const isRecording = ref(false)
const isPaused = ref(false)
const recordingTime = ref(0)
const meetingTitle = ref('')
const meetingNotes = ref('')
const showMeetingTypeModal = ref(false)
const meetingType = ref('OFFLINE') // 'ONLINE' | 'OFFLINE'
const apiStatus = ref(null)
const sensorStatus = ref({
  imu: false,
  camera: false,
  audio: false,
  appState: false
})
const edgeModelStatus = ref(null)
const keyframeCount = ref(0)
let intervalId = null
let sensorDataInterval = null
let keyframeInterval = null

const formattedTime = computed(() => {
  const hours = Math.floor(recordingTime.value / 3600)
  const minutes = Math.floor((recordingTime.value % 3600) / 60)
  const seconds = recordingTime.value % 60
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

/**
 * 初始化所有服务
 */
const initializeServices = async () => {
  try {
    console.log('🚀 Initializing services...')
    
    // 初始化边缘模型
    const modelInit = await edgeModelManager.initializeAll()
    edgeModelStatus.value = modelInit
    console.log('✅ Edge models initialized:', modelInit)
    
    // WebSocket会在开始录制时连接
    
    apiStatus.value = {
      success: true,
      message: '✅ 服务初始化完成'
    }
  } catch (error) {
    console.error('❌ Failed to initialize services:', error)
    apiStatus.value = {
      success: false,
      message: `⚠️ 初始化失败: ${error.message}`
    }
  }
}

/**
 * 开始录制
 */
const startRecording = async () => {
  try {
    console.log('🚀 Starting recording...')
    
    // 启动所有传感器
    const sensorResult = await sensorManager.startAll()
    console.log('✅ Sensors started:', sensorResult)
    
    sensorStatus.value = sensorResult.sensors
    
    // 启动WebSocket会话
    await wsClient.startSession(meetingTitle.value || 'Untitled Meeting')
    console.log('✅ WebSocket session started')
    
    // 启动定时器
    intervalId = setInterval(() => {
      if (!isPaused.value) {
        recordingTime.value++
      }
    }, 1000)
    
    // 每5秒收集并发送传感器数据
    sensorDataInterval = setInterval(async () => {
      if (!isPaused.value) {
        const data = await sensorManager.collectAllData()
        wsClient.sendSensorData(data)
        console.log('📊 Sensor data sent to server')
      }
    }, 5000)
    
    // 每10秒捕获关键帧并分析
    keyframeInterval = setInterval(async () => {
      if (!isPaused.value) {
        try {
          const sensorData = await sensorManager.collectAllData()
          let frame = { base64: null } // Default empty frame
          
          // Only capture rear camera if it's an OFFLINE meeting
          if (meetingType.value === 'OFFLINE') {
            // 捕获后置摄像头画面
            frame = await sensorManager.captureKeyframe('REAR')
          } else {
             console.log('🌐 Online meeting: Skipping rear camera capture')
             // For online meetings, we might want to still send sensor data but no visual frame,
             // or maybe just skip the visual processing part.
             // For now, let's just not capture the frame. 
             // We still need to construct a "frame" object compatible with what edgeModelManager expects if we want to run analysis?
             // Or we skip analysis too?
             // Assuming we skip visual analysis if no frame.
          }
          
          // 如果是线下会议有画面，进行边缘模型处理
          // If offline meeting with frame, process it
          let analysis = { isKeyframe: false }
          
          if (meetingType.value === 'OFFLINE' && frame.base64) {
             // 使用边缘模型处理
             analysis = await edgeModelManager.processFrame(
              frame.base64,
              sensorData
            )
          } else {
             // For online meetings, maybe we just treat it as not a keyframe for now, 
             // or we rely on audio/IMU only.
             // Let's assume no visual keyframes for online mode for now.
          }
          
          // 如果是关键帧，发送到服务器
          if (analysis.isKeyframe) {
            wsClient.sendKeyframe({
              ...frame,
              ...analysis
            })
            keyframeCount.value++
            console.log(`🖼️ Keyframe #${keyframeCount.value} sent to server`)
          }
        } catch (error) {
          console.warn('⚠️ Keyframe capture/analysis failed:', error)
        }
      }
    }, 10000)
    
    isRecording.value = true
    apiStatus.value = {
      success: true,
      message: '🎬 录制进行中...'
    }
  } catch (error) {
    console.error('❌ Failed to start recording:', error)
    apiStatus.value = {
      success: false,
      message: `❌ 启动失败: ${error.message}`
    }
    
    // 清理
    await cleanupRecording()
  }
}

/**
 * 停止录制
 */
const stopRecording = async () => {
  try {
    console.log('🛑 Stopping recording...')
    
    // 收集最终数据 (在停止传感器之前)
    const finalData = await sensorManager.collectAllData()
    
    // 停止定时器
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    if (sensorDataInterval) {
      clearInterval(sensorDataInterval)
      sensorDataInterval = null
    }
    if (keyframeInterval) {
      clearInterval(keyframeInterval)
      keyframeInterval = null
    }
    
    // 停止传感器
    const stopResult = await sensorManager.stopAll()
    console.log('✅ Sensors stopped:', stopResult)
    
    // 结束WebSocket会话
    const sessionResult = await wsClient.endSession()
    console.log('✅ WebSocket session ended:', sessionResult)
    
    // 发送最终分析请求
    const result = await analyzeAttention({
      imu_data: finalData.imu.data,
      app_state: finalData.appState.history,
      gaze_data: [] // 如果有眼动追踪数据
    })
    
    isRecording.value = false
    isPaused.value = false
    
    apiStatus.value = {
      success: true,
      message: `✅ 录制完成！注意力得分: ${result.attention_score.toFixed(2)}, 关键帧: ${keyframeCount.value}`
    }
    
    console.log('✅ Recording complete:', result)
    
    // 导航到时间线页面
    setTimeout(() => {
      router.push(`/timeline/${sessionResult.recordingId}`)
    }, 2000)
    
  } catch (error) {
    console.error('❌ Failed to stop recording:', error)
    apiStatus.value = {
      success: false,
      message: `⚠️ 停止录制时出错: ${error.message}`
    }
  } finally {
    // 确保清理状态
    isRecording.value = false
    isPaused.value = false
  }
}

/**
 * 清理资源
 */
const cleanupRecording = async () => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
  if (sensorDataInterval) {
    clearInterval(sensorDataInterval)
    sensorDataInterval = null
  }
  if (keyframeInterval) {
    clearInterval(keyframeInterval)
    keyframeInterval = null
  }
  
  try {
    await sensorManager.stopAll()
  } catch (error) {
    console.warn('⚠️ Error stopping sensors:', error)
  }
  
  isRecording.value = false
  isPaused.value = false
}

/**
 * Confirm meeting type selection
 */
const confirmMeetingType = async (type) => {
  meetingType.value = type
  showMeetingTypeModal.value = false
  await startRecording()
}

/**
 * 切换录制状态
 */
const toggleRecording = async () => {
  if (isRecording.value) {
    await stopRecording()
  } else {
    // Show modal instead of starting directly
    showMeetingTypeModal.value = true
  }
}

/**
 * 暂停/继续录制
 */
const pauseRecording = () => {
  isPaused.value = !isPaused.value
  console.log(isPaused.value ? '⏸️ Recording paused' : '▶️ Recording resumed')
  
  apiStatus.value = {
    success: true,
    message: isPaused.value ? '⏸️ 已暂停' : '▶️ 继续录制'
  }
}

onMounted(async () => {
  console.log('📱 Record component mounted')
  await initializeServices()
})

onUnmounted(async () => {
  console.log('📱 Record component unmounting')
  await cleanupRecording()
  
  // 清理WebSocket
  wsClient.disconnect()
  
  // 清理边缘模型
  edgeModelManager.dispose()
})
</script>
