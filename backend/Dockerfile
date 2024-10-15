# Use an official Node.js runtime as the base image
FROM node:alpine

# Install necessary packages for Puppeteer
# Installs Chromium package.
RUN apk add --no-cache \
    udev \
    ttf-freefont \
    chromium

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Set the working directory in the container
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . ./

EXPOSE 3001

# Define the command to run your application
CMD [ "node", "index.js" ]