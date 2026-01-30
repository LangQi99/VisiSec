<template>
  <div class="max-w-5xl mx-auto">
    <div class="mb-8">
      <router-link :to="`/timeline/${$route.params.id}`" class="text-terracotta hover:underline flex items-center space-x-2 mb-4">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span>返回时间轴</span>
      </router-link>
      
      <h1 class="text-4xl font-serif font-bold text-ink mb-2">会议纪要</h1>
      <p class="text-gray-600">AI生成的见解和待办事项</p>
    </div>

    <!-- Meeting Overview -->
    <div class="card mb-8">
      <h2 class="text-2xl font-serif font-bold text-ink mb-4">产品策略会议</h2>
      <div class="grid grid-cols-3 gap-6 mb-6">
        <div>
          <div class="text-sm text-gray-500 mb-1">日期</div>
          <div class="font-medium">2026年1月30日</div>
        </div>
        <div>
          <div class="text-sm text-gray-500 mb-1">时长</div>
          <div class="font-medium">45 分钟</div>
        </div>
        <div>
          <div class="text-sm text-gray-500 mb-1">参与者</div>
          <div class="font-medium">5 人</div>
        </div>
      </div>
      
      <div class="bg-terracotta/5 border border-terracotta/20 rounded-xl p-4">
        <h3 class="font-semibold text-ink mb-2">执行摘要</h3>
        <p class="text-gray-700">
          团队审查了Q4产品路线图，讨论了新功能的预算分配，并确定了即将推出的营销策略。关于功能优先级和时间表调整的关键决定已经做出。
        </p>
      </div>
    </div>

    <!-- Action Items -->
    <div class="card mb-8">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-2xl font-serif font-bold text-ink">待办事项</h3>
        <button class="btn-secondary text-sm">
          <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          添加到日历
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
        <h3 class="text-2xl font-serif font-bold text-ink">逐字稿</h3>
        <button class="btn-secondary text-sm">
          <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          下载
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
            <span class="font-medium text-ink">{{ line.speaker }}:</span>
            <span class="text-gray-700"> {{ line.text }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Extracted Images -->
    <div class="card">
      <h3 class="text-2xl font-serif font-bold text-ink mb-6">关键视觉与OCR</h3>
      
      <div class="grid grid-cols-2 gap-6">
        <div 
          v-for="(image, index) in extractedImages" 
          :key="index"
          class="border border-gray-200 rounded-xl overflow-hidden"
        >
          <div class="aspect-video bg-gray-100 flex items-center justify-center">
            <svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
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
import { ref } from 'vue'

const actionItems = ref([
  {
    title: '完成功能规格说明书',
    description: '完成Q4功能的详细规格说明书并与工程团队分享',
    assignee: 'Sarah Chen',
    dueDate: '2026年2月5日',
    timestamp: '12:34'
  },
  {
    title: '审查预算分配',
    description: '验证各团队的拟议预算分配',
    assignee: 'Michael Park',
    dueDate: '2026年2月3日',
    timestamp: '23:15'
  },
  {
    title: '更新营销时间表',
    description: '根据新产品发布时间表调整活动日期',
    assignee: 'Emily Rodriguez',
    dueDate: '2026年2月8日',
    timestamp: '38:42'
  }
])

const transcript = ref([
  { time: '00:00', speaker: 'Sarah', text: '大家早上好。让我们从Q4路线图概览开始。' },
  { time: '00:15', speaker: 'Michael', text: '谢谢Sarah。我准备了涵盖我们关键举措的幻灯片。' },
  { time: '00:32', speaker: 'Sarah', text: '太好了。你能带我们过一遍时间表吗？' },
  { time: '01:05', speaker: 'Michael', text: '当然。我们的目标是在11月下旬发布核心功能。' },
  { time: '01:28', speaker: 'Emily', text: '这与我们的营销日历非常吻合。' },
  { time: '02:10', speaker: 'Sarah', text: '完美。接下来让我们讨论预算影响。' },
])

const extractedImages = ref([
  { time: '05:30', ocrText: 'Q4产品路线图 - 功能优先级矩阵' },
  { time: '12:45', ocrText: '预算分配：工程45%，营销30%，运营25%' },
  { time: '25:20', ocrText: '营销策略：Q4 2026多渠道活动' },
  { time: '35:15', ocrText: '待办事项和交付物 - 时间表概览' },
])
</script>
