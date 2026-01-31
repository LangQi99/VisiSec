<template>
  <div class="max-w-4xl mx-auto py-8 px-4">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-serif font-bold text-ink mb-2">
        {{ t('settings.title') }}
      </h1>
    </div>

    <div class="space-y-6">
      <!-- Language Settings -->
      <div class="card">
        <h2 class="text-2xl font-serif font-bold text-ink mb-4">
          {{ t('settings.language') }}
        </h2>
        <p class="text-gray-600 mb-6">{{ t('settings.languageDescription') }}</p>

        <div class="flex gap-4">
          <button
            @click="changeLanguage('zh-CN')"
            class="px-6 py-3 rounded-full font-medium transition-all"
            :class="currentLocale === 'zh-CN' ? 'bg-ink text-white' : 'bg-white border border-gray-300 text-ink hover:bg-gray-50'"
          >
            中文 (简体)
          </button>
          <button
            @click="changeLanguage('en-US')"
            class="px-6 py-3 rounded-full font-medium transition-all"
            :class="currentLocale === 'en-US' ? 'bg-ink text-white' : 'bg-white border border-gray-300 text-ink hover:bg-gray-50'"
          >
            English
          </button>
        </div>

        <div v-if="languageMessage" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
          <p class="text-green-800 text-sm">{{ languageMessage }}</p>
        </div>
      </div>

      <!-- Change Password -->
      <div class="card">
        <h2 class="text-2xl font-serif font-bold text-ink mb-4">
          {{ t('settings.changePassword') }}
        </h2>

        <!-- Success Message -->
        <div v-if="successMessage" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p class="text-green-800 text-sm">{{ successMessage }}</p>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p class="text-red-800 text-sm">{{ errorMessage }}</p>
        </div>

        <form @submit.prevent="handleChangePassword" class="space-y-6">
          <!-- Current Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('settings.currentPassword') }}
            </label>
            <input
              v-model="currentPassword"
              type="password"
              :placeholder="t('settings.currentPasswordPlaceholder')"
              class="input-field w-full"
              required
            />
          </div>

          <!-- New Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('settings.newPassword') }}
            </label>
            <input
              v-model="newPassword"
              type="password"
              :placeholder="t('settings.newPasswordPlaceholder')"
              class="input-field w-full"
              required
            />
          </div>

          <!-- Confirm New Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('settings.confirmPassword') }}
            </label>
            <input
              v-model="confirmPassword"
              type="password"
              :placeholder="t('settings.confirmPasswordPlaceholder')"
              class="input-field w-full"
              required
            />
          </div>

          <!-- Buttons -->
          <div class="flex gap-4">
            <button
              type="submit"
              class="btn-primary"
              :disabled="loading"
            >
              <span v-if="!loading">{{ t('settings.submit') }}</span>
              <span v-else>{{ t('common.loading') }}</span>
            </button>
            <button
              type="button"
              @click="resetForm"
              class="btn-secondary"
            >
              {{ t('settings.cancel') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { changePassword } from '../services/auth'

const { t, locale } = useI18n()

const currentLocale = computed(() => locale.value)

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const languageMessage = ref('')
const loading = ref(false)

const changeLanguage = (newLocale) => {
  locale.value = newLocale
  localStorage.setItem('locale', newLocale)
  languageMessage.value = t('settings.languageChanged')
  
  // Clear message after 3 seconds
  setTimeout(() => {
    languageMessage.value = ''
  }, 3000)
}

const resetForm = () => {
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  errorMessage.value = ''
  successMessage.value = ''
}

const handleChangePassword = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  // Validation
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = t('auth.errors.passwordMismatch')
    return
  }

  if (newPassword.value.length < 6) {
    errorMessage.value = t('auth.errors.passwordRequired')
    return
  }

  loading.value = true

  try {
    await changePassword(currentPassword.value, newPassword.value)
    successMessage.value = t('settings.passwordChanged')
    resetForm()
  } catch (error) {
    errorMessage.value = error.message || t('auth.errors.changePasswordFailed')
  } finally {
    loading.value = false
  }
}
</script>
