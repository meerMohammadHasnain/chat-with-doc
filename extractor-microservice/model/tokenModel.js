/*
*
* Model for token entity
*
*/

// Dependencies
import userAccessor from './../accessor/userAccessor';
import logger from './../util/logger';
import Model from './../schema/userSchema';
import helpers from './../util/helpers';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {config} from 'config';
import statusCodes from './../util/statusCodes';

// Container function for token model
var TokenModel = function() {};

// Model function for creating an auth token
TokenModel.prototype.createAuthToken = async function(userData) {
  // Connect to the database
  await userAccessor.connectDatabase()
      .catch(err => {
        logger.error("[%s] Could not connect to the database, error: [%s]", userData.email, err);
        throw {
          'statusCode' : statusCodes.INTERNAL_SERVER_ERROR,
          'body' : {
            'error' : 'Encountered an unexpected error while authenticating the user'
          }
        };
      });
  // Get the user document from the database
  var response = await userAccessor.getUser({'email' : userData.email})
      .catch(err => {
        logger.error("[%s] Encountered an unexpected error while authenticating the user, error: [%s]",
           userData.email,
           err);
        throw {
          'statusCode' : statusCodes.INTERNAL_SERVER_ERROR,
          'body' : {
            'error' : 'Encountered an unexpected error while authenticating the user'
          }
        };
      });
  if(response) {
    // If the user document exists, compare the hashed password stored therein
    // and the password that's received in the request.
    var isMatching = await bcrypt.compare(userData.password, response.password)
        .catch(err => {
          logger.error("[%s] Encountered an unexpected error while authenticating the user, error: [%s]",
             userData.email,
             err);
          throw {
            'statusCode' : statusCodes.INTERNAL_SERVER_ERROR,
            'body' : {
              'error' : 'Encountered an unexpected error while authenticating the user'
            }
          };
        });
    if(isMatching) {
      // If the passwords match (authentication successful), sign the token
      var authToken = await helpers.signToken({'user' : response},
                                              config.authTokenSecret,
                                              {'issuer': config.authTokenIssuer})
            .catch(err => {
              logger.error("[%s] Encountered an unexpected error while generating the token, error: [%s]",
                  userData.email,
                  err);
              throw {
                'statusCode' : statusCodes.INTERNAL_SERVER_ERROR,
                'body' : {
                  'error' : 'Encountered an unexpected error while generating the token'
                }
              };
            })
      // If signing was successful, proceed with further steps
      logger.info("[%s] Generated the auth token successfully", response.email);
      // Return the signed JSON Web Token in the response
      return {
        'statusCode' : statusCodes.HTTP_OK,
        'body' : {
          'userId' : response['_id'],
          'authToken' : authToken
        }
      };
    } else {
      // If the paswords don't match (authentication failed), throw an unauthenticated user error
      return {'statusCode' : statusCodes.UNAUTHENTICATED_USER, 'body' : {'error' : 'Unauthenticated user'}};
    }
  } else {
    // If the user document is not found in the database, assume the request
    // to be raised by an unauthenticated user
    return {'statusCode' : statusCodes.UNAUTHENTICATED_USER, 'body' : {'error' : 'Unauthenticated user'}};
  }
};

// Export the module
export default new TokenModel();
