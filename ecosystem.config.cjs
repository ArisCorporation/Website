module.exports = {
  apps: [
    {
      name: 'myapp',
      script: '.output/server/index.mjs',
      port: 4001,
      watch: true,
    },
  ],
};
