/*
*
* Utility middlewares
*
*/

// Dependencies
import helpers from './helpers';
import logger from './logger';
import {validationResult} from 'express-validator';
import {config} from 'config';
import statusCodes from './statusCodes';

// Container function for utility middlewares
var UtilMiddlewares = function() {};

// JSON parsing error handling middleware
UtilMiddlewares.prototype.catchParsingError = function() {
  return function(err, req, res, next) {
    if(err) {
      res.status(statusCodes.BAD_REQUEST)
         .send({'error' : 'Invalid JSON in the input'});
    } else {
      next();
    }
  };
};

// Default error handling middleware
UtilMiddlewares.prototype.defaultErrorHandler = function() {
  return function(err, req, res, next) {
    if(err) {
      res.status(statusCodes.INTERNAL_SERVER_ERROR)
         .send({'error' : 'Encountered an unexpected error while serving the request'});
    } else {
      next();
    }
  };
};

// Authentication token validation middleware
UtilMiddlewares.prototype.verifyAuthentication = function() {
  return async function(req, res, next) {
    // Get the auth token from the request header
    var authToken = req.headers.token;
    if(authToken) {
       // Verify the JSON Web Token
       await helpers.verifyToken(authToken)
        .then(response => {
          req.userEmail = response.user.email;
          req.userIdInToken = response.user['_id'];
          next();
        })
        .catch(err => {
             if(err.name) {
               if(err.name == 'TokenExpiredError') {
                 res.status(statusCodes.UNAUTHENTICATED_USER)
                    .send({'error' : 'Token has already expired'});
               } else {
                 res.status(statusCodes.UNAUTHENTICATED_USER)
                    .send({'error' : 'Unauthenticated user'});
               }
             } else {
               logger.error("Encountered an unexpected error while authenticating the user, error: [%s]", err);
               res.status(statusCodes.INTERNAL_SERVER_ERROR)
                  .send({'error' : 'Encountered an unexpected error while authenticating the user'});
             }
        });
    } else {
      res.status(statusCodes.UNAUTHENTICATED_USER)
         .send({'error' : 'Missing authentication token'});
    }
  }
};

// Request validation middleware
UtilMiddlewares.prototype.validateRequest = function() {
  return function(req, res, next) {
    if(!validationResult(req).isEmpty()) {
      res.status(statusCodes.BAD_REQUEST)
         .send({'body' : 'Missing or invalid required field(s)'});
    } else {
      next();
    }
  };
};

// Export the module
export default new UtilMiddlewares();
