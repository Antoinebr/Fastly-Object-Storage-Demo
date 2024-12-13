const path = require('path');

// Function to get the correct content type based on file extension
const getContentType = (fileName) => {
  const extname = path.extname(fileName).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.html': 'text/html',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg',
  };

  return mimeTypes[extname] || 'application/octet-stream'; // Default to binary stream if no match
};

module.exports = { getContentType };