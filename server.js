const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const {
  ApolloServerPluginDrainHttpServer,
} = require('@apollo/server/plugin/drainHttpServer');
const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const allResolvers = require('./schema/allResolvers/index.js');
const allTypeDefs = require('./schema/typeDefs/index.js');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const Business = require('./models/businessModel.js');


dotenv.config();

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Mongodb connected');
  })
  .catch((err) => {
    console.log(err);
  });

// Express app setup
const app = express();
const httpServer = http.createServer(app);

// ApolloServer setup
const server = new ApolloServer({
  typeDefs: allTypeDefs,
  resolvers: allResolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// Authentication middleware
app.use(
  cors({
    credentials: true,
    origin: ['http://localhost:3000', 'http://localhost:4000/graphql'],
  })
);

app.use(async (req, res, next) => {
  try {
    if (req.path === '/login' || req.path.startsWith('/public')) {
      return next(); // Skip authentication
    }

    const authorization = req.headers.authorization;
    const businessId = req.headers['x-business-id'];
    console.log('busiess', businessId);

    if (authorization && businessId) {
      const token = authorization.slice(7); // Extract token
      const business = await Business.findById(businessId); // Ensure async is awaited

      if (!business) {
        return next(); // Proceed if business is not found
      }

      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          req.user = null; // Invalid token
          return next(); // Call next() to proceed
        }

        const userHasAdminAccess = business.admins.includes(decoded.id);
        const userHasEditorAccess = business.editors.includes(decoded.id);

        if (!userHasAdminAccess && !userHasEditorAccess) {
          return res.status(403).json({
            error: 'You do not have access to this business account',
          });
        }

        req.user = decoded; // Set user info
        req.business = business; // Set business info
        return next(); // Proceed to next middleware
      });
    } else {
      next(); // No authorization or business ID, proceed to next middleware
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    next(error); // Pass errors to Express error-handling middleware
  }
});

// Middleware for cookies and parsing requests
app.use(cookieParser());

// Start the server
async function startServer() {
  await server.start(); // Ensure Apollo Server starts before using the middleware

  app.use(
    '/graphql',
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        const user = req.user;
        const business = req.business;
        return { res, user, business };
      },
    })
  );

  await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve)); // Start HTTP server
  console.log(`🚀 Server ready at http://localhost:4000`);
}

// Start the server
startServer().catch((err) => {
  console.error('Error starting server:', err);
});
