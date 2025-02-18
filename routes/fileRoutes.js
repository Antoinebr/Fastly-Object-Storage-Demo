const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand, GetObjectCommand, ListBucketsCommand, DeleteBucketCommand, ListObjectsV2Command, CreateBucketCommand } = require('@aws-sdk/client-s3');
const { getContentType } = require('../utils/fileUtils');


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
            secretAccessKey: secretKey
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


router.get('/list-buckets', async (req, res) => {
    const { accessKeyId, region, secretKey } = req.query;

    // Validate input parameters
    if (!accessKeyId) {
        return res.status(400).json({ error: 'Missing required parameter: accessKeyId' });
    }
    if (!region) {
        return res.status(400).json({ error: 'Missing required parameter: region' });
    }
    if (!secretKey) {
        return res.status(400).json({ error: 'Missing required parameter: secretKey' });
    }

    // Configure S3 Client
    const s3Client = new S3Client({
        region,
        endpoint: `https://${region}.object.fastlystorage.app`,
        credentials: {
            accessKeyId,
            secretAccessKey: secretKey
        },
        forcePathStyle: true,
    });

    try {
        const command = new ListBucketsCommand({});
        const response = await s3Client.send(command);

        res.status(200).json({ buckets: response.Buckets });
    } catch (error) {
        console.error('Error listing buckets:', error);
        res.status(500).json({ error: 'Could not retrieve the bucket list.' });
    }
});


router.delete('/delete-bucket', async (req, res) => {
    const { bucketName, accessKeyId, region, secretKey } = req.body;

    // Validate input parameters
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

    // Configure S3 Client
    const s3Client = new S3Client({
        region,
        endpoint: `https://${region}.object.fastlystorage.app`,
        credentials: {
            accessKeyId,
            secretAccessKey: secretKey
        },
        forcePathStyle: true,
    });

    try {
        const command = new DeleteBucketCommand({ Bucket: bucketName });
        await s3Client.send(command);

        res.status(200).json({ message: `Bucket '${bucketName}' deleted successfully.` });
    } catch (error) {
        console.error('Error deleting bucket:', error);
        res.status(500).json({ error: `Could not delete the bucket '${bucketName}'. It may not be empty or it may not exist.` });
    }
});



router.get('/bucket/:bucketName/:key', async (req, res) => {
    const { bucketName, key } = req.params;

    const accessKeyId = req.cookies.accessKeyId;
    const secretKey = req.cookies.secretKey;
    const region = req.cookies.region;


    // Validate input parameters
    if (!accessKeyId || !secretKey || !region) {
        return res.status(400).json({ error: 'Missing required credentials (accessKeyId, secretKey, region).' });
    }

    try {
        // Configure S3 Client
        const s3Client = new S3Client({
            region,
            endpoint: `https://${region}.object.fastlystorage.app`,
            credentials: {
                accessKeyId,
                secretAccessKey: secretKey
            },
            forcePathStyle: true,
        });

        // Get object from bucket
        const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
        const response = await s3Client.send(command);

        // Set response headers
        res.setHeader('Content-Type', response.ContentType || 'application/octet-stream');
        res.setHeader('Content-Length', response.ContentLength);

        // Stream the file to the response
        response.Body.pipe(res);
    } catch (error) {
        console.error('Error fetching file:', error);
        res.status(500).json({ error: 'Could not retrieve the file.' });
    }
});

router.get('/bucket/:bucketName', async (req, res) => {
    const { bucketName } = req.params;
    const { accessKeyId, region, secretKey } = req.query;

    // Validate input parameters
    if (!bucketName) {
        return res.status(400).json({ error: 'Bucket name is required.' });
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

    // Configure S3 Client
    const s3Client = new S3Client({
        region,
        endpoint: `https://${region}.object.fastlystorage.app`,
        credentials: {
            accessKeyId,
            secretAccessKey: secretKey
        },
        forcePathStyle: true,
    });

    try {
        // List objects in the bucket
        const command = new ListObjectsV2Command({ Bucket: bucketName });
        const response = await s3Client.send(command);

        // Extract file details
        const files = response.Contents ? response.Contents.map(file => ({
            Key: file.Key,
            LastModified: file.LastModified,
            Size: file.Size
        })) : [];

        res.status(200).json({ bucket: bucketName, files });
    } catch (error) {
        console.error('Error listing files in bucket:', error);
        res.status(500).json({ error: 'Could not retrieve the files in the bucket.' });
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
        console.log(data.Contents);
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



router.post('/bucket/:bucketName', upload.single('file'), async (req, res) => {
    const { bucketName } = req.params;
    const { accessKeyId, secretKey, region } = req.body;

    // Validate input parameters
    if (!accessKeyId || !secretKey || !region) {
        return res.status(400).json({ error: 'Missing required credentials: accessKeyId, secretKey, or region.' });
    }
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    // Configure S3 client
    const s3Client = new S3Client({
        region,
        endpoint: `https://${region}.object.fastlystorage.app`,
        credentials: {
            accessKeyId,
            secretAccessKey: secretKey
        },
        forcePathStyle: true,
    });

    // Prepare S3 upload parameters
    const params = {
        Bucket: bucketName,
        Key: req.file.originalname, // File name in the bucket
        Body: req.file.buffer, // File data
        ContentType: req.file.mimetype, // File MIME type
    };

    try {
        const command = new PutObjectCommand(params);
        await s3Client.send(command);

        res.status(200).json({ message: `File "${req.file.originalname}" uploaded successfully to bucket "${bucketName}".` });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Could not upload the file.' });
    }
});


module.exports = router;