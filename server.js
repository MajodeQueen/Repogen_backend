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

app.use(cookieParser());
app.use(bodyParser.json());
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:4000/graphql'],
    credentials: true, // Allow credentials (cookies)
  })
);


app.use(async (req, res, next) => {
  try {
    // const authCookie = req.cookies.authData;

    const authCookie = req.headers.cookie

    console.log('.........Headers........', authCookie)

    if (!authCookie) {
      console.log('No auth cookie found. Proceeding without authentication.');
      return next();
    }

    let token, BusinessId;

    // Try to parse the auth cookie
    try {
      const parsedCookie = JSON.parse(authCookie);
      token = parsedCookie.token;
      BusinessId = parsedCookie.BusinessId;
    } catch (error) {
      console.error('Failed to parse auth cookie:', error.message);
      throw new Error('Invalid auth cookie: Failed to parse');
    }

    // Validate token and BusinessId
    if (!token || !BusinessId) {
      throw new Error('Invalid auth cookie: Missing token or BusinessId');
    }

    // Fetch the business associated with the BusinessId
    const business = await Business.findById(BusinessId);
    if (!business) {
      throw new Error('Business not found');
    }

    // Verify the JWT token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        throw new Error('Invalid or expired token');
      }

      // Check user access to the business
      const userHasAdminAccess = business.admins.includes(decoded.id);
      const userHasEditorAccess = business.editors.includes(decoded.id);

      if (!userHasAdminAccess && !userHasEditorAccess) {
        throw new Error('You do not have access to this business account');
      }

      // Attach user and business info to the request object
      req.user = decoded;
      req.business = business;
    });

    next(); // Proceed to the next middleware or route
  } catch (error) {
    console.error('Authentication middleware error:', error.message);

    // Allow requests without cookies to proceed, but log the error for debugging
    res.status(403).json({ error: error.message });
  }
});


// Start the server
async function startServer() {
  await server.start(); // Ensure Apollo Server starts before using the middleware


  app.use(
    '/graphql',
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
