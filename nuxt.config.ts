// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: [
    '~/assets/css/tailwind.css',
    "@watergis/maplibre-gl-terradraw/dist/maplibre-gl-terradraw.css",
    "vue-toastification/dist/index.css",
  ],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  plugins: ["@/plugins/vue-toastification.js", "@/plugins/axios.js",
  ],
  modules: ['@pinia/nuxt'],
  build: { transpile: ['vue-toastification'] },
  runtimeConfig: {
    public: {
      systemName: process.env.SYSTEM_NAME || 'กระบวนการเดินเมือง',
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3123',
    },
  },
  app: {
    head: {
      title: 'PPLE Hackable City', // Default title
      meta: [
        { name: 'description', content: 'ระบบจัดเก็บข้อมูลเมือง พรรคประชาชน' },
        { property: 'og:title', content: 'PPLE Hackable City' },
        { property: 'og:description', content: 'ระบบจัดเก็บข้อมูลเมือง พรรคประชาชน' },
        { property: 'og:image', content: '/images/thumbnail.png' }, // Path to your thumbnail image
        { property: 'og:type', content: 'website' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },
})