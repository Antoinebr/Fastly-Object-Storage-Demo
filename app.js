require('dotenv').config();
const express = require('express');
const exphbs = require('express-handlebars');
const fileRoutes = require('./routes/fileRoutes');

const app = express();
const port = process.env.PORT || 3009;

// Middleware for parsing incoming requests
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static('public'));

app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');


app.get('/', (req, res) => {
  res.render('index', { title: 'Homepage', message: 'Welcome to the Homepage!' });
});

app.get('/bucket', (req, res) => {
  res.render('bucket', { title: 'Create Bucket', message: 'Create Bucket' });
});

app.get('/upload', (req, res) => {
  res.render('upload', { title: 'Upload', message: 'Upload here' });
});

// Use fileRoutes
app.use('/s3', fileRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});