# Use an official Node.js image as the base
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Set environment variable for React development server polling
ENV CHOKIDAR_USEPOLLING=true

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
