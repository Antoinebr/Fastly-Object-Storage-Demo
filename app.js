#!/usr/bin/env node

const express = require('express');
const cookieParser = require("cookie-parser");

const exphbs = require('express-handlebars');
const fileRoutes = require('./routes/fileRoutes');

const path = require("path");

const app = express();
const port = process.env.PORT || 3009;

// Get the absolute path to the views directory
const viewsPath = path.join(__dirname, "views");
const publicPath = path.join(__dirname, "public");

// Middleware for parsing incoming requests
app.use(express.json());
app.use(cookieParser());

// Serve static files from the "public" directory
app.use(express.static(publicPath));

app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.set("views", viewsPath);


app.get('/', (req, res) => {
  res.render('index', { title: 'Homepage', message: 'Welcome to the Homepage!' });
});


app.get('/bucket/:bucketname', (req, res) => {
  res.render('singleBucket', { title: 'Create Bucket', message: 'Create Bucket' });
});

// Use fileRoutes
app.use('/s3', fileRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Fastly Object Storage Easy UI is now up and running! 🎉 Visit 👉 http://localhost:${port}`);
});