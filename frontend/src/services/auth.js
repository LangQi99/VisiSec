import { ref } from 'vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5124'

// User state
export const currentUser = ref(null)
export const isAuthenticated = ref(false)

// Initialize auth state from localStorage
export function initAuth() {
  const token = localStorage.getItem('auth_token')
  const user = localStorage.getItem('auth_user')
  
  if (token && user) {
    currentUser.value = JSON.parse(user)
    isAuthenticated.value = true
  }
}

// Register new user
export async function register(username, password) {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Registration failed')
  }

  // Store token and user info
  localStorage.setItem('auth_token', data.token)
  localStorage.setItem('auth_user', JSON.stringify(data.user))
  
  currentUser.value = data.user
  isAuthenticated.value = true

  return data
}

// Login user
export async function login(username, password) {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Login failed')
  }

  // Store token and user info
  localStorage.setItem('auth_token', data.token)
  localStorage.setItem('auth_user', JSON.stringify(data.user))
  
  currentUser.value = data.user
  isAuthenticated.value = true

  return data
}

// Logout user
export function logout() {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user')
  currentUser.value = null
  isAuthenticated.value = false
}

// Change password
export async function changePassword(currentPassword, newPassword) {
  const token = localStorage.getItem('auth_token')
  
  if (!token) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Password change failed')
  }

  return data
}

// Get auth headers for authenticated requests
export function getAuthHeaders() {
  const token = localStorage.getItem('auth_token')
  
  if (!token) {
    return {}
  }

  return {
    'Authorization': `Bearer ${token}`
  }
}
