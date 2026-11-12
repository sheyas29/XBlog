const cypress = require('cypress');
const fs = require('fs');
require('dotenv').config();

cypress
  .run({
    spec: 'cypress/e2e/spec.cy.js',
    env: {
      clientUrl: process.env.CLIENT_URL,
      backendUrl: process.env.BACKEND_URL,
    },
  })
  .then((results) => {
    fs.writeFileSync('cypressResults.json', JSON.stringify(results, null, 2));
  })
  .catch((err) => {
    console.error(err.stack);
  });
