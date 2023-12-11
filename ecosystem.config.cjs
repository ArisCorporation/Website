module.exports = {
  apps: [
    {
      name: 'myapp',
      script: '.output/server/index.mjs',
      port: 3001,
      watch: true,
    },
  ],
};
