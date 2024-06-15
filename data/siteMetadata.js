/** @type {import("pliny/config").PlinyConfig } */
const siteMetadata = {
  title: "Jiaqi.Li 's Blog",
  author: 'Jiaqi.Li',
  headerTitle: "Jiaqi.Li 's Blog",
  description: '“Never memorize something that you can look up.” - Albert Einstein',
  language: 'zh-cn',
  theme: 'system', // system, dark or light
  siteUrl: 'https://blog.justdev.cn',
  siteRepo: 'https://github.com/wmasfoe/next.justdev.cn',
  siteLogo: '/static/images/logo.png',
  socialBanner: '/static/images/twitter-card.png',
  email: 'lijq1103@gmail.com',
  github: 'https://github.com/wmasfoe',
  twitter: 'https://twitter.com/JiaqiLi1103',
  facebook: 'https://www.facebook.com/profile.php?id=100050238352500&mibextid=LQQJ4d',
  locale: 'zh-CN',
  analytics: {
    // TODO google 分析
    // If you want to use an analytics provider you have to add it to the
    // content security policy in the `next.config.js` file.
    // supports Plausible, Simple Analytics, Umami, Posthog or Google Analytics.
    // umamiAnalytics: {
    //   // We use an env variable for this site to avoid other users cloning our analytics ID
    //   umamiWebsiteId: process.env.NEXT_UMAMI_ID, // e.g. 123e4567-e89b-12d3-a456-426614174000
    // },
    // plausibleAnalytics: {
    //   plausibleDataDomain: '', // e.g. tailwind-nextjs-starter-blog.vercel.app
    // },
    // simpleAnalytics: {},
    // posthogAnalytics: {
    //   posthogProjectApiKey: '', // e.g. 123e4567-e89b-12d3-a456-426614174000
    // },
    // googleAnalytics: {
    //   googleAnalyticsId: '', // e.g. G-XXXXXXX
    // },
  },
  comments: {
    // Select a provider and use the environment variables associated to it
    // https://vercel.com/docs/environment-variables
    provider: 'giscus', // supported providers: giscus, utterances, disqus
    giscusConfig: {
      repo: 'wmasfoe/blog-comment',
      repositoryId: 'R_kgDOJfcBiQ',
      category: 'General',
      categoryId: 'DIC_kwDOJfcBic4CWS_T',
      mapping: 'pathname',
      reactions: '1',
      metadata: '0',
      inputPosition: 'top',
      lang: 'en',
      darkTheme: 'dark',
      theme: 'light',
      themeURL: '',
    },
  },
  search: {
    provider: 'kbar', // kbar or algolia
    kbarConfig: {
      searchDocumentsPath: 'search.json', // path to load documents to search
    },
    // provider: 'algolia',
    // algoliaConfig: {
    //   // The application ID provided by Algolia
    //   appId: 'R2IYF7ETH7',
    //   // Public API key: it is safe to commit it
    //   apiKey: '599cec31baffa4868cae4e79f180729b',
    //   indexName: 'docsearch',
    // },
  },
}

module.exports = siteMetadata
