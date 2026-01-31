import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Record from '../views/Record.vue'
import Timeline from '../views/Timeline.vue'
import Summary from '../views/Summary.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Settings from '../views/Settings.vue'
import { isAuthenticated } from '../services/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: { requiresGuest: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings,
      meta: { requiresAuth: true }
    },
    {
      path: '/record',
      name: 'record',
      component: Record
    },
    {
      path: '/timeline/:id',
      name: 'timeline',
      component: Timeline
    },
    {
      path: '/summary/:id',
      name: 'summary',
      component: Summary
    }
  ]
})

// Navigation guards
router.beforeEach((to, from, next) => {
  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    next('/login')
  }
  // Check if route is for guests only (login/register)
  else if (to.meta.requiresGuest && isAuthenticated.value) {
    next('/')
  }
  else {
    next()
  }
})

export default router
