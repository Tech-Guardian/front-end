import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/Dashboard.vue')
    },
    {
      path: '/reports',
      name: 'reports',
      component: () => import('@/views/Reports.vue')
    },
    {
      path: '/manualEdit',
      name: 'manualEdit',
      component: () => import('@/views/ManualEdit.vue')
    },
    {
      path: '/userControl',
      name: 'userControl',
      component: () => import('@/views/UserControl.vue')
    },
    {
      path: '/configRedzone',
      name: 'configRedzone',
      component: () => import('@/views/ConfigRedzone.vue')
    },
    {
      path: '/myAccount',
      name: 'myAccount',
      component: () => import('@/views/MyAccount.vue')
    }
  ]
})

export default router
