<template>
  <div class="max-w-6xl mx-auto">
    <div class="mb-8">
      <router-link to="/" class="text-terracotta hover:underline flex items-center space-x-2 mb-4">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span>{{ t('timeline.backToHome') }}</span>
      </router-link>
      
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-4xl font-serif font-bold text-ink mb-2">{{ t('timeline.title') }}</h1>
          <p class="text-gray-600">{{ t('timeline.subtitle') }}</p>
        </div>
        <router-link :to="`/summary/${$route.params.id}`" class="btn-primary">
          {{ t('timeline.viewSummary') }}
        </router-link>
      </div>
    </div>

    <!-- Meeting Info Card -->
    <div class="card mb-8">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-2xl font-serif font-bold text-ink">{{ t('timeline.sample.meetingTitle') }}</h2>
          <p class="text-gray-500">{{ t('timeline.sample.meetingDate') }}</p>
        </div>
        <div class="flex space-x-2">
          <button class="btn-secondary text-sm">
            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {{ t('timeline.export') }}
          </button>
          <button class="btn-secondary text-sm">
            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {{ t('timeline.share') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Attention Heatmap -->
    <div class="card mb-8">
      <h3 class="text-xl font-serif font-bold text-ink mb-4">{{ t('timeline.heatmap') }}</h3>
      <div class="relative">
        <!-- Timeline -->
        <div class="h-24 bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-xl mb-4 relative overflow-hidden">
          <!-- Time markers -->
          <div class="absolute inset-0 flex items-end pb-2 px-2">
            <div class="flex justify-between w-full text-xs text-white font-medium">
              <span>0:00</span>
              <span>15:00</span>
              <span>30:00</span>
              <span>45:00</span>
            </div>
          </div>
          
          <!-- Key moment markers -->
          <div 
            v-for="marker in keyMoments" 
            :key="marker.time"
            :style="{ left: `${(marker.time / 45) * 100}%` }"
            class="absolute top-0 bottom-0 w-1 bg-white/50"
          >
            <div class="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full border-2 border-ink"></div>
          </div>
        </div>
        
        <!-- Legend -->
        <div class="flex items-center justify-center space-x-6 text-sm">
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-green-400 rounded"></div>
            <span class="text-gray-600">{{ t('timeline.attention.high') }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-yellow-400 rounded"></div>
            <span class="text-gray-600">{{ t('timeline.attention.medium') }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-red-400 rounded"></div>
            <span class="text-gray-600">{{ t('timeline.attention.low') }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-white rounded border-2 border-ink"></div>
            <span class="text-gray-600">{{ t('timeline.attention.keyMoment') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Key Moments -->
    <div class="card">
      <h3 class="text-xl font-serif font-bold text-ink mb-6">{{ t('timeline.keyMoments') }}</h3>
      
      <div class="space-y-6">
        <div 
          v-for="moment in keyMoments" 
          :key="moment.time"
          class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pb-6 border-b border-gray-100 last:border-0"
        >
          <!-- Thumbnail -->
          <div class="flex-shrink-0 w-full h-48 sm:w-48 sm:h-32 bg-gray-200 rounded-xl overflow-hidden relative group">
            <template v-if="moment.image">
              <img :src="moment.image" :alt="moment.title" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            </template>
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
              <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          
          <!-- Content -->
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <span class="px-3 py-1 bg-terracotta/10 text-terracotta rounded-full text-sm font-medium">
                {{ formatTime(moment.time) }}
              </span>
              <span :class="[
                'px-3 py-1 rounded-full text-sm font-medium',
                moment.attention === 'high' ? 'bg-green-100 text-green-700' :
                moment.attention === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              ]">
                {{ t(`timeline.attention.${moment.attention}`) }}
              </span>
            </div>
            
            <h4 class="font-serif font-bold text-ink mb-2">{{ moment.title }}</h4>
            <p class="text-gray-600 text-sm mb-3">{{ moment.description }}</p>
            
            <!-- Audio snippet -->
            <div class="flex items-center space-x-3">
              <button class="w-8 h-8 bg-ink rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
              <div class="flex-1 h-1 bg-gray-200 rounded-full">
                <div class="h-full bg-terracotta rounded-full" :style="{ width: '0%' }"></div>
              </div>
              <span class="text-sm text-gray-500">0:{{ String(moment.duration).padStart(2, '0') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const keyMoments = computed(() => [
  {
    time: 5,
    duration: 45,
    title: t('timeline.sample.moments.1.title'),
    description: t('timeline.sample.moments.1.description'),
    attention: 'high',
    image: '/mock/1.jpg'
  },
  {
    time: 12,
    duration: 32,
    title: t('timeline.sample.moments.2.title'),
    description: t('timeline.sample.moments.2.description'),
    attention: 'medium',
    image: '/mock/2.jpg'
  },
  {
    time: 25,
    duration: 28,
    title: t('timeline.sample.moments.3.title'),
    description: t('timeline.sample.moments.3.description'),
    attention: 'medium',
    image: '/mock/3.jpg'
  },
  {
    time: 35,
    duration: 52,
    title: t('timeline.sample.moments.4.title'),
    description: t('timeline.sample.moments.4.description'),
    attention: 'low',
    image: '/mock/4.jpg'
  }
])

const formatTime = (minutes) => {
  const mins = Math.floor(minutes)
  const secs = Math.floor((minutes - mins) * 60)
  return `${mins}:${String(secs).padStart(2, '0')}`
}
</script>
