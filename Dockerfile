# Use the official Node.js 22 image as the base image
FROM node:22

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if exists) to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files to the container
COPY . .

# Expose the port the app will run on
EXPOSE 3009

# Set the environment variable to production
ENV NODE_ENV=production

# Run the application when the container starts
CMD ["node", "app.js"]