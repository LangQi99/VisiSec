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
            <span class="text-xl font-serif font-bold text-ink">{{ t('home.title') }}</span>
          </router-link>
          
          <div class="hidden md:flex space-x-6">
            <router-link 
              to="/" 
              class="text-gray-600 hover:text-ink transition-colors font-medium"
              active-class="text-ink font-semibold"
            >
              {{ t('nav.home') }}
            </router-link>
            <router-link 
              to="/record" 
              class="text-gray-600 hover:text-ink transition-colors font-medium"
              active-class="text-ink font-semibold"
            >
              {{ t('nav.record') }}
            </router-link>
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
          <!-- Not logged in -->
          <router-link v-if="!isAuthenticated" to="/login" class="btn-secondary text-sm">
            {{ t('nav.login') }}
          </router-link>

          <!-- Logged in - show user menu -->
          <div v-else class="relative">
            <button
              @click="toggleMenu"
              class="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <!-- Avatar with first letter -->
              <div class="w-10 h-10 bg-terracotta rounded-full flex items-center justify-center">
                <span class="text-white font-serif font-bold text-lg">
                  {{ userInitial }}
                </span>
              </div>
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="showMenu"
              class="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-gray-200 py-2 z-50"
            >
              <div class="px-4 py-2 border-b border-gray-100">
                <p class="text-sm font-medium text-ink">{{ currentUser?.username }}</p>
              </div>
              
              <router-link
                to="/settings"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                @click="showMenu = false"
              >
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{{ t('nav.settings') }}</span>
                </div>
              </router-link>

              <button
                @click="handleLogout"
                class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>{{ t('nav.logout') }}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { isAuthenticated, currentUser, logout, initAuth } from '../services/auth'

const { t } = useI18n()
const router = useRouter()

const showMenu = ref(false)

const userInitial = computed(() => {
  if (!currentUser.value?.username) return '?'
  return currentUser.value.username.charAt(0).toUpperCase()
})

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const handleLogout = () => {
  logout()
  showMenu.value = false
  router.push('/')
}

// Close menu when clicking outside
const handleClickOutside = (event) => {
  if (showMenu.value && !event.target.closest('.relative')) {
    showMenu.value = false
  }
}

onMounted(() => {
  initAuth()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
