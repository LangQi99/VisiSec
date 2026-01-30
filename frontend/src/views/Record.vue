<template>
  <div class="max-w-4xl mx-auto">
    <div class="mb-8">
      <router-link to="/" class="text-terracotta hover:underline flex items-center space-x-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span>返回首页</span>
      </router-link>
    </div>

    <div class="card">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-serif font-bold text-ink mb-4">录制会议</h1>
        <p class="text-gray-600">
          捕捉音频、视频和上下文，进行智能分析
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
          {{ isRecording ? '正在录制中' : '准备录制' }}
        </div>
      </div>

      <!-- Active Sensors -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <svg class="w-8 h-8 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <div class="text-sm font-medium text-green-900">音频</div>
          <div class="text-xs text-green-600">已激活</div>
        </div>

        <div class="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <svg class="w-8 h-8 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <div class="text-sm font-medium text-green-900">前置摄像头</div>
          <div class="text-xs text-green-600">已激活</div>
        </div>

        <div class="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <svg class="w-8 h-8 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div class="text-sm font-medium text-green-900">后置摄像头</div>
          <div class="text-xs text-green-600">已激活</div>
        </div>

        <div class="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <svg class="w-8 h-8 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <div class="text-sm font-medium text-green-900">IMU传感器</div>
          <div class="text-xs text-green-600">已激活</div>
        </div>
      </div>

      <!-- Meeting Info -->
      <div class="space-y-4 mb-8">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">会议标题</label>
          <input 
            v-model="meetingTitle"
            type="text" 
            class="input-field w-full"
            placeholder="例如：产品策略会议"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">备注（可选）</label>
          <textarea 
            v-model="meetingNotes"
            class="input-field w-full"
            rows="3"
            placeholder="添加关于此次会议的任何备注..."
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
          {{ isRecording ? '停止录制' : '开始录制' }}
        </button>
        
        <button 
          v-if="isRecording"
          @click="pauseRecording"
          class="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full font-semibold text-lg transition-all"
        >
          {{ isPaused ? '继续' : '暂停' }}
        </button>
      </div>

      <!-- API Status -->
      <div v-if="apiStatus" class="mt-6 p-4 rounded-lg" :class="apiStatus.success ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'">
        <p class="text-sm">{{ apiStatus.message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { analyzeAttention } from '../services/api'

const router = useRouter()
const isRecording = ref(false)
const isPaused = ref(false)
const recordingTime = ref(0)
const meetingTitle = ref('')
const meetingNotes = ref('')
const apiStatus = ref(null)
let intervalId = null

const formattedTime = computed(() => {
  const hours = Math.floor(recordingTime.value / 3600)
  const minutes = Math.floor((recordingTime.value % 3600) / 60)
  const seconds = recordingTime.value % 60
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const toggleRecording = async () => {
  if (isRecording.value) {
    console.log('🛑 Stopping recording...')
    // Stop recording
    isRecording.value = false
    isPaused.value = false
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    
    // Test API call with sample data
    try {
      console.log('📊 Sending attention analysis data to backend...')
      const result = await analyzeAttention({
        imu_data: [/* sample data */],
        app_state: [/* sample data */],
        gaze_data: [/* sample data */]
      })
      
      apiStatus.value = {
        success: true,
        message: `✅ 分析完成！注意力得分: ${result.attention_score}`
      }
      
      console.log('✅ Analysis complete:', result)
      
      // Only navigate on success
      setTimeout(() => {
        router.push('/timeline/1')
      }, 2000)
    } catch (error) {
      console.error('❌ Analysis failed:', error)
      apiStatus.value = {
        success: false,
        message: '⚠️ 后端分析失败，但录制已保存'
      }
      // Don't navigate on error, let user decide
    }
  } else {
    console.log('▶️ Starting recording...')
    // Start recording
    isRecording.value = true
    recordingTime.value = 0
    apiStatus.value = null
    intervalId = setInterval(() => {
      if (!isPaused.value) {
        recordingTime.value++
      }
    }, 1000)
  }
}

const pauseRecording = () => {
  isPaused.value = !isPaused.value
  console.log(isPaused.value ? '⏸️ Recording paused' : '▶️ Recording resumed')
}

onMounted(() => {
  console.log('📱 Record component mounted')
})

onUnmounted(() => {
  console.log('📱 Record component unmounting')
  // Clean up interval if component is destroyed
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
})
</script>
