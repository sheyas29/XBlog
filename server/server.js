const express = require('express');
require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const configureCloudinary = require('./config/cloudinary');

const port = 5000;

connectDB();
configureCloudinary();

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
