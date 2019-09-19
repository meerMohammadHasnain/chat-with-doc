/*
*
* Application file for 'extractor' microservice
*
*/

// Dependencies
import express from 'express';
import bodyParser from 'body-parser';
import userRoutes from './controller/userRoutes';
import tokenRoute from './controller/tokenRoute';
import chatRoutes from './controller/chatRoutes';
import heartbeatRoute from './controller/heartbeatRoute';
import defaultRoute from './controller/defaultRoute';
import utilMiddlewares from './util/utilMiddlewares';
import register from './util/register';
import logger from './util/logger';
import {config} from 'config';

// Router and app object
const router = express.Router();
const app = express();

// Register a middleware to parse request body
app.use(bodyParser.json());

// Register a middleware to handle json parsing errors in request body
app.use(utilMiddlewares.catchParsingError());

// Routing to the middleware of '/users' route
app.use(userRoutes(router));

// Routing to the middleware of '/token' route
app.use(tokenRoute(router));

// Routing to the middleware of '/chats' route
app.use(chatRoutes(router));

// Router to the middleware of '/heartbeat' route
app.use(heartbeatRoute(router));

// Regsiter default error handling middleware
app.use(utilMiddlewares.defaultErrorHandler());

// Register default routing middleware to handle invalid routes
app.use('*', defaultRoute(router));

// Start the server
app.listen(config.port, () => {
  logger.info('HTTP server listening on port %s', config.port);
  // Register the microservice in Consul Service Registry
  register.registerService();
});
