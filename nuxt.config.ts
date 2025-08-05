// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@vite-pwa/nuxt',
  ],
  pwa: {
    manifest: {
      name: 'Workout-Planner',
      lang: 'de',
      start_url: 'https://workout-seven-peach.vercel.app',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#000000',
    },
  },
})