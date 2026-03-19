import { defineRoutesSetup } from '@slidev/types'

export default defineRoutesSetup((routes) => {
  const musicianRoute = {
    name: 'musician',
    path: '/musician',
    component: () => import('../src/pages/MusicianPage.vue'),
  }

  const playRouteIndex = routes.findIndex(route => route.name === 'play')
  if (playRouteIndex === -1)
    routes.unshift(musicianRoute)
  else
    routes.splice(playRouteIndex, 0, musicianRoute)

  return routes
})