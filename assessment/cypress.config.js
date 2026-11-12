const { defineConfig } = require('cypress');
require('dotenv').config();

module.exports = defineConfig({
  e2e: {
    // baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      config.env = config.env || {};
      config.env.frontendUrl = 'http://localhost:3000';
      config.env.backendUrl = 'http://localhost:5000';

      return config;
    },
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    viewportWidth: 1280,
    viewportHeight: 800,
    chromeWebSecurity: false,
  },
});
