export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  server: {
    host: '0', // default: localhost
    port: process.env.PORT || 3000 // default: 3000
  },

  head () {
    const i18nHead = this.$nuxtI18nHead({ addSeoAttributes: true })
    return {
      title: 'Zoom Panda!',
      htmlAttrs: {
        ...i18nHead.htmlAttrs
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: '' },
        { name: 'format-detection', content: 'telephone=no' },
        ...i18nHead.meta
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        ...i18nHead.link
      ]
    }
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '@/assets/styles/dark-mode.scss',
    '@/assets/styles/app.scss'
  ],

  bootstrapVue: {
    bootstrapCSS: false,
    bootstrapVueCSS: false
  },

  // Workaround needed for dev mode to work w/ Firestore's experimentalLongPolling
  // Why do we need experimentalLongPolling? Issues w/ Windows, antiviruses, etc. See : https://stackoverflow.com/a/72564439/17503172
  // Why do we need runInNewContext? See https://github.com/nuxt-community/firebase-module/issues/116
  // Also see: https://github.com/nuxt/nuxt/issues/7266#issuecomment-638382133
  render: {
    bundleRenderer: {
      runInNewContext: false
    }
  },

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    'bootstrap-vue/nuxt',
    // https://i18n.nuxtjs.org/basic-usage - Need to register Axios AFTER i18n
    '@nuxtjs/i18n',
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios'
  ],

  i18n: {
    baseUrl: 'https://panda.up.railway.app', // TODO Required for SEO: https://i18n.nuxtjs.org/seo
    strategy: 'no_prefix', // Our game heavily uses dynamic URLs, e.g.) domain.com/AX7F, we don't want i18n prefixes
    locales: [
      {
        code: 'en',
        iso: 'en-US',
        file: 'en.js',
        isCatchallLocale: true
      },
      {
        code: 'fr',
        iso: 'fr-FR',
        file: 'fr.js'
      },
      {
        code: 'zh',
        iso: 'zh-CN',
        file: 'zh.js'
      }
    ],
    lazy: true,
    langDir: 'lang/',
    defaultLocale: 'en',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root' // recommended: https://i18n.nuxtjs.org/browser-language-detection
    }
  },

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
    baseURL: '/'
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    extend(config, ctx) {
      if (ctx.isDev) {
        config.devtool = ctx.isClient ? 'source-map' : 'inline-source-map'
      }
    }
  },

  // Explicit SSR mode
  ssr: true
}
