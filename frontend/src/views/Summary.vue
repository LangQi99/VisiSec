<template>
  <div class="max-w-5xl mx-auto">
    <div class="mb-8">
      <router-link :to="`/timeline/${$route.params.id}`" class="text-terracotta hover:underline flex items-center space-x-2 mb-4">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span>{{ t('summary.backToTimeline') }}</span>
      </router-link>
      
      <h1 class="text-4xl font-serif font-bold text-ink mb-2">{{ t('summary.title') }}</h1>
      <p class="text-gray-600">{{ t('summary.subtitle') }}</p>
    </div>

    <!-- Meeting Overview -->
    <div class="card mb-8">
      <h2 class="text-2xl font-serif font-bold text-ink mb-4">{{ t('timeline.sample.meetingTitle') }}</h2>
      <div class="grid grid-cols-3 gap-6 mb-6">
        <div>
          <div class="text-sm text-gray-500 mb-1">{{ t('summary.overview.date') }}</div>
          <div class="font-medium">{{ t('summary.sample.overview.date') }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-500 mb-1">{{ t('summary.overview.duration') }}</div>
          <div class="font-medium">{{ t('summary.sample.overview.duration') }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-500 mb-1">{{ t('summary.overview.participants') }}</div>
          <div class="font-medium">{{ t('summary.sample.overview.participants') }}</div>
        </div>
      </div>
      
      <div class="bg-terracotta/5 border border-terracotta/20 rounded-xl p-4">
        <h3 class="font-semibold text-ink mb-2">{{ t('summary.overview.executiveSummary') }}</h3>
        <p class="text-gray-700">
          {{ t('summary.sample.overview.content') }}
        </p>
      </div>
    </div>

    <!-- Action Items -->
    <div class="card mb-8">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-2xl font-serif font-bold text-ink">{{ t('summary.actionItems.title') }}</h3>
        <button class="btn-secondary text-sm">
          <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {{ t('summary.actionItems.addToCalendar') }}
        </button>
      </div>
      
      <div class="space-y-4">
        <div 
          v-for="(item, index) in actionItems" 
          :key="index"
          class="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <input 
            type="checkbox" 
            class="mt-1 w-5 h-5 text-terracotta border-gray-300 rounded focus:ring-terracotta"
          />
          <div class="flex-1">
            <h4 class="font-semibold text-ink mb-1">{{ item.title }}</h4>
            <p class="text-sm text-gray-600 mb-2">{{ item.description }}</p>
            <div class="flex items-center space-x-4 text-sm">
              <div class="flex items-center space-x-1 text-gray-500">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{{ item.assignee }}</span>
              </div>
              <div class="flex items-center space-x-1 text-gray-500">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{{ item.dueDate }}</span>
              </div>
              <div class="flex items-center space-x-1 text-terracotta">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ item.timestamp }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Full Transcript -->
    <div class="card mb-8">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-2xl font-serif font-bold text-ink">{{ t('summary.transcript.title') }}</h3>
        <button class="btn-secondary text-sm">
          <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {{ t('summary.transcript.download') }}
        </button>
      </div>
      
      <div class="space-y-4 max-h-96 overflow-y-auto pr-2">
        <div 
          v-for="(line, index) in transcript" 
          :key="index"
          class="flex space-x-4"
        >
          <div class="flex-shrink-0 w-16 text-sm text-gray-400 font-mono">
            {{ line.time }}
          </div>
          <div class="flex-1">
            <span class="font-bold text-ink mr-1">{{ line.speaker }}:</span>
            <span class="text-gray-700">{{ line.text }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Extracted Images -->
    <div class="card">
      <h3 class="text-2xl font-serif font-bold text-ink mb-6">{{ t('summary.visuals.title') }}</h3>
      
      <div class="grid grid-cols-2 gap-6">
        <div 
          v-for="(image, index) in extractedImages" 
          :key="index"
          class="border border-gray-200 rounded-xl overflow-hidden"
        >
          <div class="aspect-video bg-gray-100 flex items-center justify-center relative overflow-hidden group">
            <template v-if="image.image">
              <img :src="image.image" :alt="image.ocrText" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            </template>
            <div v-else class="flex items-center justify-center w-full h-full">
              <svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div class="p-4 bg-white">
            <div class="text-xs text-gray-500 mb-2">{{ image.time }}</div>
            <p class="text-sm text-gray-700">{{ image.ocrText }}</p>
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
const actionItems = computed(() => [
  {
    title: t('summary.sample.actionItems.1.title'),
    description: t('summary.sample.actionItems.1.description'),
    assignee: 'Sarah Chen',
    dueDate: 'Feb 5, 2026',
    timestamp: '12:34'
  },
  {
    title: t('summary.sample.actionItems.2.title'),
    description: t('summary.sample.actionItems.2.description'),
    assignee: 'Michael Park',
    dueDate: 'Feb 3, 2026',
    timestamp: '23:15'
  },
  {
    title: t('summary.sample.actionItems.3.title'),
    description: t('summary.sample.actionItems.3.description'),
    assignee: 'Emily Rodriguez',
    dueDate: 'Feb 8, 2026',
    timestamp: '38:42'
  }
])

const transcript = computed(() => [
  { time: '00:00', speaker: t('summary.sample.speakers.instructor'), text: t('summary.sample.transcript.1') },
  { time: '00:15', speaker: t('summary.sample.speakers.instructor'), text: t('summary.sample.transcript.2') },
  { time: '00:32', speaker: t('summary.sample.speakers.student'), text: t('summary.sample.transcript.3') },
  { time: '01:05', speaker: t('summary.sample.speakers.instructor'), text: t('summary.sample.transcript.4') },
  { time: '01:28', speaker: t('summary.sample.speakers.instructor'), text: t('summary.sample.transcript.5') },
  { time: '02:10', speaker: t('summary.sample.speakers.instructor'), text: t('summary.sample.transcript.6') },
])

const extractedImages = computed(() => [
  { time: '05:30', ocrText: t('summary.sample.visuals.1'), image: '/mock/1.jpg' },
  { time: '12:45', ocrText: t('summary.sample.visuals.2'), image: '/mock/2.jpg' },
  { time: '25:20', ocrText: t('summary.sample.visuals.3'), image: '/mock/3.jpg' },
  { time: '35:15', ocrText: t('summary.sample.visuals.4'), image: '/mock/4.jpg' },
])
</script>
