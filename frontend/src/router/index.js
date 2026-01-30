import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Record from '../views/Record.vue'
import Timeline from '../views/Timeline.vue'
import Summary from '../views/Summary.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
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

export default router
