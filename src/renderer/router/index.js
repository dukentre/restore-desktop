import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'main',
      component: require('@/views/Main').default
    },
    {
      path: '/exit',
      name: 'exit',
      component: require('@/views/Exit').default
    },
    {
      path: '/settings/main',
      name: 'settings-main',
      component: require('@/views/SettingsMain').default
    },
    {
      path: '/settings/security',
      name: 'settings-security',
      component: require('@/views/SettingsSecurity').default
    },
    {
      path: '/settings/network',
      name: 'settings-network',
      component: require('@/views/SettingsNetwork').default
    },
    {
      path: '/about/program',
      name: 'about-program',
      component: require('@/views/AboutProgram').default
    },
    {
      path: '/about/author',
      name: 'about-author',
      component: require('@/views/AboutAuthor').default
    },
    {
      path: '/about/history',
      name: 'about-history',
      component: require('@/views/AboutHistory').default
    },
    {
      path: '/save-desktop',
      name: 'save-desktop',
      component: require('@/views/SaveDesktop').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
