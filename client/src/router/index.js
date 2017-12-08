import Vue from 'vue'
import Router from 'vue-router'
import Queue from '@/components/Queue'
import Search from '@/components/Search'
import You from '@/components/You'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Queue',
      component: Queue
    },
    {
      path: '/search',
      name: 'Search',
      component: Search
    },
    { path: '/you',
      name: 'You',
      component: You
    }
  ]
})
