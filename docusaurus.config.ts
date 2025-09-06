import { Config } from '@docusaurus/types';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import webpack from 'webpack';

const config: Config = {
  title: 'EUV Lithography Guide',
  tagline: 'A visual, student-friendly guide to next-generation semiconductor manufacturing',
  url: 'http://localhost',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'your-org',
  projectName: 'euv-guide-site',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  
  // SEO and meta
  headTags: [
    { tagName: 'link', attributes: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' } },
    { tagName: 'link', attributes: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
    { tagName: 'meta', attributes: { name: 'theme-color', content: '#071021' } },
    { tagName: 'meta', attributes: { property: 'og:type', content: 'website' } },
    { tagName: 'meta', attributes: { property: 'og:title', content: 'EUV Lithography Guide' } },
    { tagName: 'meta', attributes: { property: 'og:description', content: 'A visual, student-friendly guide to next-generation semiconductor manufacturing' } },
    { tagName: 'meta', attributes: { name: 'twitter:card', content: 'summary_large_image' } },
  ],
  
  presets: [
    [
      'classic',
      ({
        docs: {
          sidebarPath: './sidebars.ts',
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        },
        blog: false,
        theme: {
          customCss: ['./src/css/custom.css', './src/css/print.css'],
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
        },
      }),
    ],
  ],
  themes: [
    '@easyops-cn/docusaurus-search-local'
  ],
  
  plugins: [
    ['@docusaurus/plugin-pwa', {
      debug: false,
      offlineModeActivationStrategies: ['appInstalled', 'standalone', 'queryString'],
      pwaHead: [
        { tagName: 'link', rel: 'icon', href: '/img/favicon.png' },
        { tagName: 'meta', name: 'theme-color', content: '#071021' },
        { tagName: 'link', rel: 'manifest', href: '/manifest.json' },
      ],
    }],
    // Custom webpack configuration
    () => ({
      name: 'webpack-config',
      configureWebpack(config: any, isServer: boolean) {
        if (!isServer) {
          config.resolve = config.resolve || {};
          config.resolve.fallback = {
            ...config.resolve.fallback,
            "fs": false,
            "path": require.resolve("path-browserify"),
            "os": require.resolve("os-browserify/browser"),
            "crypto": require.resolve("crypto-browserify"),
            "stream": require.resolve("stream-browserify"),
            "http": require.resolve("stream-http"),
            "https": require.resolve("https-browserify"),
            "url": require.resolve("url/"),
            "util": require.resolve("util/"),
            "zlib": require.resolve("browserify-zlib"),
            "assert": require.resolve("assert"),
            "net": false,
            "tls": false,
            "dns": false
          };

          config.plugins = config.plugins || [];
          config.plugins.push(
            new webpack.ProvidePlugin({
              Buffer: ['buffer', 'Buffer'],
              process: 'process/browser',
            })
          );
        }
        return config;
      },
    }),
  ],
  
  // Stylesheets for KaTeX and fonts
  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
      type: 'text/css',
      integrity: 'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
      crossorigin: 'anonymous',
    },
    {
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap',
      type: 'text/css',
    },
  ],
};

export default config;