// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
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
        { property: 'og:image', content: 'https://hackcity.pplethai.org/images/thumbnail.png' }, // Path to your thumbnail image
        { property: 'og:type', content: 'website' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0' }, // Prevent zoom on input focus
        { name: 'author', content: 'PPLE Team' }, // Optional: Specify the author or organization
        { name: 'robots', content: 'noindex, nofollow' }, // SEO: Allow search engines to index and follow links
        { name: 'theme-color', content: '#ff6a13' }, // Theme color for mobile browsers
        { name: 'keywords', content: 'Hackable City, PPLE, เมือง, ระบบจัดเก็บข้อมูล' }, // Keywords for SEO
        { property: 'og:locale', content: 'th_TH' }, // Specify the locale if targeting Thai users
        { property: 'og:url', content: 'https://hackcity.pplethai.org' } // Replace with your actual URL
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },
})