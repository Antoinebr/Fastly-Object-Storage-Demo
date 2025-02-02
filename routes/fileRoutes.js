const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, CreateBucketCommand } = require('@aws-sdk/client-s3');
const authenticate = require('../middleware/authMiddleware');
const { getContentType } = require('../utils/fileUtils');
// const s3Client = require('../utils/s3Client');




const router = express.Router();

// Set up multer to handle file uploads
const storage = multer.memoryStorage(); // Store file in memory (you can change to diskStorage if preferred)
const upload = multer({ storage: storage });

// Endpoint to create an S3 bucket
router.post('/create-bucket', async (req, res) => {

  const { bucketName, accessKeyId, region, secretKey } = req.body;

  // Check each parameter individually
  if (!bucketName) {
    return res.status(400).json({ error: 'Missing required parameter: bucketName' });
  }
  if (!accessKeyId) {
    return res.status(400).json({ error: 'Missing required parameter: accessKeyId' });
  }
  if (!region) {
    return res.status(400).json({ error: 'Missing required parameter: region' });
  }
  if (!secretKey) {
    return res.status(400).json({ error: 'Missing required parameter: secretKey' });
  }


    // Configuration for S3 Client
  const s3Client = new S3Client({
    region,
    endpoint: `https://${region}.object.fastlystorage.app`,
    credentials: {
      accessKeyId,
      secretAccessKey : secretKey
    },
    forcePathStyle: true,
  });



  if (!bucketName) {
    return res.status(400).json({ error: 'Bucket name is required.' });
  }

  const command = new CreateBucketCommand({
    Bucket: bucketName,
  });

  try {
    await s3Client.send(command);
    res.status(200).json({ message: `Bucket '${bucketName}' created successfully.` });
  } catch (error) {
    console.error('Error creating bucket:', error);
    res.status(500).json({ error: 'Could not create the bucket.' });
  }
});

// Endpoint to fetch and return the file
router.get('/get/:key', async (req, res) => {
  const key = req.params.key; // The file name, e.g., 'pic.jpg'

  const command = new GetObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: key,
  });

  try {
    const data = await s3Client.send(command);

    // Dynamically set the Content-Type header based on file extension
    const contentType = getContentType(key);
    res.setHeader('Content-Type', contentType);
    
    // Dynamically set Content-Disposition header
    res.setHeader('Content-Disposition', `inline; filename="${key}"`);

    // Stream the file content to the response
    data.Body.pipe(res);
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ error: 'Could not fetch the file.' });
  }
});

// Route to list all items in the bucket with additional metadata
router.get('/list-files', async (req, res) => {
  const command = new ListObjectsV2Command({
    Bucket: process.env.BUCKET_NAME,
  });

  try {
    const data = await s3Client.send(command);

    // Extract detailed information about each file
    const fileList = data.Contents.map(item => ({
      key: item.Key,
      url: `/s3/get/${item.Key}`,
      lastModified: item.LastModified,
      size: item.Size,
      etag: item.ETag,
    }));

    res.status(200).json(fileList);
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Could not list the files.' });
  }
});

// Endpoint to upload a file to the S3 bucket
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const { originalname, buffer } = req.file; // Get the uploaded file's name and buffer (content)
  const contentType = getContentType(originalname); // Get the content type based on the file extension

  const command = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: originalname, // Use the original file name or generate a unique key
    Body: buffer,
    ContentType: contentType,
  });

  try {
    // Upload the file to S3
    await s3Client.send(command);
    res.status(200).json({ message: 'File uploaded successfully.' });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Could not upload the file.' });
  }
});

module.exports = router;