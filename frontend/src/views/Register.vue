<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Register Card -->
      <div class="card">
        <!-- Logo -->
        <div class="flex justify-center mb-8">
          <div class="w-16 h-16 bg-ink rounded-2xl flex items-center justify-center">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
        </div>

        <!-- Title -->
        <h1 class="text-4xl font-serif font-bold text-ink text-center mb-2">
          {{ t('auth.register.title') }}
        </h1>
        <p class="text-lg text-gray-500 text-center mb-8">
          {{ t('auth.register.subtitle') }}
        </p>

        <!-- Error Message -->
        <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p class="text-red-800 text-sm">{{ errorMessage }}</p>
        </div>

        <!-- Register Form -->
        <form @submit.prevent="handleRegister">
          <!-- Username -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('auth.register.username') }}
            </label>
            <input
              v-model="username"
              type="text"
              :placeholder="t('auth.register.usernamePlaceholder')"
              class="input-field w-full"
              required
            />
          </div>

          <!-- Password -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('auth.register.password') }}
            </label>
            <input
              v-model="password"
              type="password"
              :placeholder="t('auth.register.passwordPlaceholder')"
              class="input-field w-full"
              required
            />
          </div>

          <!-- Confirm Password -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('auth.register.confirmPassword') }}
            </label>
            <input
              v-model="confirmPassword"
              type="password"
              :placeholder="t('auth.register.confirmPasswordPlaceholder')"
              class="input-field w-full"
              required
            />
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn-primary w-full mb-4"
            :disabled="loading"
          >
            <span v-if="!loading">{{ t('auth.register.submit') }}</span>
            <span v-else>{{ t('common.loading') }}</span>
          </button>
        </form>

        <!-- Login Link -->
        <p class="text-center text-sm text-gray-600">
          {{ t('auth.register.hasAccount') }}
          <router-link to="/login" class="text-terracotta hover:underline font-medium">
            {{ t('auth.register.login') }}
          </router-link>
        </p>
      </div>

      <!-- Back to Home -->
      <div class="text-center mt-6">
        <router-link to="/" class="text-sm text-gray-500 hover:text-ink transition-colors">
          ← {{ t('nav.home') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { register } from '../services/auth'

const { t } = useI18n()
const router = useRouter()

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const loading = ref(false)

const handleRegister = async () => {
  errorMessage.value = ''

  // Validation
  if (password.value !== confirmPassword.value) {
    errorMessage.value = t('auth.errors.passwordMismatch')
    return
  }

  loading.value = true

  try {
    await register(username.value, password.value)
    router.push('/')
  } catch (error) {
    errorMessage.value = error.message || t('auth.errors.registerFailed')
  } finally {
    loading.value = false
  }
}
</script>
