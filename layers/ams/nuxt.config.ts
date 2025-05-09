export default defineNuxtConfig({
  components: [
    // Disable prefixing base components with `Base`
    { path: './components/', prefix: 'AMS' },
  ],

  future: {
    compatibilityVersion: 4
  },
});