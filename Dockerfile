FROM mhart/alpine-node:12


# Create app directory
WORKDIR /src

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .



# Make port 3000 available to the world outside this container
EXPOSE 4000

CMD [ "node", "server.js" ]

# RUN npm run serve