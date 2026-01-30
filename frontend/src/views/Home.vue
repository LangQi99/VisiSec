<template>
  <div class="max-w-6xl mx-auto">
    <!-- Hero Section -->
    <div class="text-center py-16">
      <h1 class="text-6xl font-serif font-bold text-ink mb-6 tracking-tight">
        VisiSec
      </h1>
      <p class="text-2xl text-gray-600 mb-4 font-light">
        Your Intelligent Meeting Assistant
      </p>
      <p class="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
        Capture, analyze, and never miss a moment with multimodal sensing technology
      </p>
      
      <div class="flex justify-center space-x-4">
        <router-link to="/record" class="btn-primary">
          Start Recording
        </router-link>
        <button class="btn-secondary">
          Learn More
        </button>
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
        <h3 class="text-xl font-serif font-bold mb-2">Visual Capture</h3>
        <p class="text-gray-600">
          Dual camera streams capture presentation content and your attention patterns
        </p>
      </div>

      <div class="card">
        <div class="w-12 h-12 bg-terracotta/10 rounded-xl flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <h3 class="text-xl font-serif font-bold mb-2">Audio Recording</h3>
        <p class="text-gray-600">
          High-fidelity audio capture with smart transcription and speaker detection
        </p>
      </div>

      <div class="card">
        <div class="w-12 h-12 bg-terracotta/10 rounded-xl flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 class="text-xl font-serif font-bold mb-2">Smart Analytics</h3>
        <p class="text-gray-600">
          AI-powered attention tracking and automatic action item extraction
        </p>
      </div>
    </div>

    <!-- Recent Meetings -->
    <div class="py-16">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-3xl font-serif font-bold text-ink">Recent Meetings</h2>
        <button class="text-terracotta hover:underline">View All</button>
      </div>
      
      <div class="space-y-4">
        <div class="card flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-gray-100 rounded-xl"></div>
            <div>
              <h4 class="font-serif font-bold text-ink">Product Strategy Meeting</h4>
              <p class="text-sm text-gray-500">2 hours ago · 45 minutes</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Processed</span>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        <div class="card flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-gray-100 rounded-xl"></div>
            <div>
              <h4 class="font-serif font-bold text-ink">Design Review</h4>
              <p class="text-sm text-gray-500">Yesterday · 1 hour 20 minutes</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Processed</span>
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
</script>
