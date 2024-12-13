const { S3Client } = require('@aws-sdk/client-s3');

// Configuration for S3 Client
const s3Client = new S3Client({
  region: process.env.REGION || 'eu-central',
  endpoint: `https://${process.env.REGION}.object.fastlystorage.app`,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

module.exports = s3Client;