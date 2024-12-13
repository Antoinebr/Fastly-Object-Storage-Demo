require('dotenv').config();
const express = require('express');
const fileRoutes = require('./routes/fileRoutes');

const app = express();
const port = process.env.PORT || 3009;

// Middleware for parsing incoming requests
app.use(express.json());

// Use fileRoutes
app.use('/s3', fileRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});