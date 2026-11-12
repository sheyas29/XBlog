const express = require('express');
require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const configureCloudinary = require('./config/cloudinary');

const port = process.env.PORT || 5000;

connectDB();
configureCloudinary();

app.listen(port, '0.0.0.0', () => {
  console.log('Server running on port ' + port);
});
