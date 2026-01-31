<template>
  <div class="max-w-6xl mx-auto">
    <!-- Hero Section -->
    <div class="text-center py-16">
      <h1 class="text-6xl font-serif font-bold text-ink mb-6 tracking-tight">
        {{ t('home.title') }}
      </h1>
      <p class="text-2xl text-gray-600 mb-4 font-light">
        {{ t('home.subtitle') }}
      </p>
      <p class="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
        {{ t('home.description') }}
      </p>
      
      <div class="flex justify-center space-x-4">
        <router-link to="/record" class="btn-primary">
          {{ t('home.startRecording') }}
        </router-link>
        <button @click="testConnection" class="btn-secondary">
          {{ t('home.testConnection') }}
        </button>
      </div>

      <!-- Connection Status -->
      <div v-if="connectionStatus" class="mt-4 p-4 rounded-lg inline-block" :class="connectionStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'">
        <p class="font-medium">{{ connectionStatus.message }}</p>
        <p v-if="connectionStatus.llmConfigured !== undefined" class="text-sm mt-1">
          {{ t('home.messages.llmStatus', { status: connectionStatus.llmConfigured ? t('home.messages.llmConfigured') : t('home.messages.llmNotConfigured') }) }}
        </p>
      </div>
    </div>

    <!-- Features Grid -->
    <div class="grid md:grid-cols-3 gap-8 py-16">
      <div class="card">
        <div class="w-12 h-12 bg-terracotta/10 rounded-xl flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <h3 class="text-xl font-serif font-bold mb-2">{{ t('home.features.vision.title') }}</h3>
        <p class="text-gray-600">
          {{ t('home.features.vision.description') }}
        </p>
      </div>

      <div class="card">
        <div class="w-12 h-12 bg-terracotta/10 rounded-xl flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <h3 class="text-xl font-serif font-bold mb-2">{{ t('home.features.audio.title') }}</h3>
        <p class="text-gray-600">
          {{ t('home.features.audio.description') }}
        </p>
      </div>

      <div class="card">
        <div class="w-12 h-12 bg-terracotta/10 rounded-xl flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 class="text-xl font-serif font-bold mb-2">{{ t('home.features.analysis.title') }}</h3>
        <p class="text-gray-600">
          {{ t('home.features.analysis.description') }}
        </p>
      </div>
    </div>

    <!-- Recent Meetings -->
    <div class="py-16">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-3xl font-serif font-bold text-ink">{{ t('home.recentMeetings') }}</h2>
        <button class="text-terracotta hover:underline">{{ t('home.viewAll') }}</button>
      </div>
      
      <div class="space-y-4">
        <div class="card flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-gray-100 rounded-xl"></div>
            <div>
              <h4 class="font-serif font-bold text-ink">{{ t('home.mock.meeting1.title') }}</h4>
              <p class="text-sm text-gray-500">{{ t('home.mock.meeting1.time') }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">{{ t('status.processed') }}</span>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        <div class="card flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-gray-100 rounded-xl"></div>
            <div>
              <h4 class="font-serif font-bold text-ink">{{ t('home.mock.meeting2.title') }}</h4>
              <p class="text-sm text-gray-500">{{ t('home.mock.meeting2.time') }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">{{ t('status.processed') }}</span>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { checkHealth } from '../services/api'

const { t } = useI18n()

const connectionStatus = ref(null)

const testConnection = async () => {
  console.log('🔍 Testing backend connection...')
  connectionStatus.value = null
  
  try {
    const result = await checkHealth()
    console.log('✅ Backend connection successful:', result)
    
    connectionStatus.value = {
      success: true,
      message: t('home.messages.connectionSuccess', { version: result.version }),
      llmConfigured: result.llm_configured
    }
  } catch (error) {
    console.error('❌ Backend connection failed:', error)
    connectionStatus.value = {
      success: false,
      message: t('home.messages.connectionFailed')
    }
  }
}
</script>
