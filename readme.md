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


## Getting Started

### Prerequisites

1. Node.js or Docker
2. Fastly Object Storage credentials



### Docker 

```
make build 
``` 

```
make run
```

## Install Dependencies

```
npm install
```

Run Locally

```
node app.js
```

Access the app at http://localhost:3009.
