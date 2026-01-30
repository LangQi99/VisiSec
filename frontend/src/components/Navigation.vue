<template>
  <nav class="bg-white border-b border-gray-200">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center space-x-8">
          <router-link to="/" class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-ink rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <span class="text-xl font-serif font-bold text-ink">VisiSec</span>
          </router-link>
          
          <div class="hidden md:flex space-x-6">
            <router-link 
              to="/" 
              class="text-gray-600 hover:text-ink transition-colors font-medium"
              active-class="text-ink font-semibold"
            >
              首页
            </router-link>
            <router-link 
              to="/record" 
              class="text-gray-600 hover:text-ink transition-colors font-medium"
              active-class="text-ink font-semibold"
            >
              录制
            </router-link>
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
          <button class="btn-secondary text-sm">
            登录
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
</script>
