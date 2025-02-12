FROM node:18-alpine

# Create app directory
WORKDIR /src

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port 4000 inside the container
EXPOSE 4000

# Start the application
CMD ["node", "server.js"]
