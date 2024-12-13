# Fastly Object Storage Demo

This project is a demonstration of **Fastly Object Storage**, a newly released service (December 2024) designed for scalable, reliable, and high-performance object storage. The demo provides an easy-to-use API for uploading, fetching, listing, and managing files stored in a Fastly S3-compatible storage bucket.

## Features

- **File Upload**: Securely upload files to a Fastly Object Storage bucket.
- **File Retrieval**: Fetch files dynamically with proper MIME type headers.
- **List Files**: List all files in the bucket along with metadata such as size and last modified date.
- **Authentication**: Protect sensitive routes (like file uploads) with password authentication using hashed passwords (via bcrypt).

## Technologies Used

- **Node.js**: Backend runtime environment.
- **Express**: Web framework for creating API routes.
- **AWS SDK for JavaScript v3**: To interact with Fastly's S3-compatible storage API.
- **Multer**: Middleware for handling file uploads.
- **bcrypt**: For securely hashing and verifying passwords.


## Getting Started

### Prerequisites

1. Node.js 
2. Fastly Object Storage credentials

### Environment Variables

Create a `.env` file in the project root with the following content:

```env
ACCESS_KEY_ID=PUT_YOUR_ACCESS_KEY_ID_HERE
SECRET_ACCESS_KEY=PUT_YOUR_SECRET_ACCESS_KEY_HERE
PORT=PUT_YOUR_PORT_HERE
PASSWORD=PUT_YOUR_ENCRYPTED_PASSWORD_HERE
BUCKET_NAME=PUT_YOUR_BUCKET_NAME_HERE
REGION=PUT_YOUR_REGION_HERE
```

To generate a PASSWORD_HASH, you can use a tool like bcrypt in Node.js.

## Install Dependencies

```
npm install
```

Run Locally
```

node app.js
```

Access the app at http://localhost:3009.


## API Endpoints

### File Upload

#### POST /upload

Upload a file to the bucket. Requires authentication via x-password header.

Example (using curl):

```
curl -X POST http://localhost:3009/upload \
  -H "x-password: YOUR_PASSWORD" \
  -F "file=@/path/to/your/file.jpg"
```


### Fetch File

#### GET /file/:key

Fetch a file by its key. Example:


```
curl http://localhost:3009/s3/get/pic.jpg
```

### List Files

#### GET /list-files

Retrieve a list of all files in the bucket, along with metadata.

Contributions

This project is intended as a demo and is not production-ready. Feel free to fork and modify it for your own experiments or projects.

Author: Antoine Brossault
Date: December 2024

