/*
*
* Model for user entity
*
*/

// Dependencies
import userAccessor from './../accessor/userAccessor';
import logger from './../util/logger';
import Model from './../schema/userSchema';
import helpers from './../util/helpers';
import statusCodes from './../util/statusCodes';

// Container function for user model
var UserModel = function() {};

// Model function for creating a user
UserModel.prototype.createUser = async function(userData) {
  // Connect to the database
  await userAccessor.connectDatabase()
      .catch(err => {
        logger.error("[%s] Could not connect to the database, error: [%s]", userData.email, err);
        throw {
          'statusCode' : statusCodes.INTERNAL_SERVER_ERROR,
          'body' : {
            'error' : 'Encountered an unexpected error while creating the user'
          }
        };
      });
  // Check if the user already exists
  var isExistingUser = await Model.exists({'email' : userData.email})
      .catch(err => {
        logger.error("[%s] Encountered an unexpected error while creating the user, error: [%s]",
                      userData.email,
                      err);
        throw {
          'statusCode' : statusCodes.INTERNAL_SERVER_ERROR,
          'body' : {
            'error' : 'Encountered an unexpected error while creating the user'
          }
        };
  });
  if(isExistingUser) {
    // Throw a bad request error if the user already exists
    return {
      'statusCode' : statusCodes.BAD_REQUEST,
      'body' : {
        'error' : 'User already exists'
      }
    };
  } else {
    // If the user is a new user, hash the password
    userData.password = await helpers.hash(userData.password)
         .catch(err => {
           logger.error("[%s] Could not hash the password, error: [%s]", userData.email, err);
           throw {
             'statusCode' : statusCodes.INTERNAL_SERVER_ERROR,
             'body' : {
               'error' : 'Encountered an unexpected error while creating the user'
             }
           };
         });
    // Create the user document in the database
    var response = await userAccessor.createUser(userData)
         .catch(err => {
           logger.error("[%s] Could not create the user, error [%s]: ", userData.email, err);
           throw {
             'statusCode' : statusCodes.INTERNAL_SERVER_ERROR,
             'body' : {
               'error' : 'Could not create the user'
             }
          };
         });
   logger.info("[%s] Created the user successfully, email: '%s'", userData.email, response.email);
   // Return the response
   return {
     'statusCode' : statusCodes.CREATED,
     'body' : {
       'firstName' : response.firstName,
       'lastName' : response.lastName,
       'email' : response.email,
       'phone' : response.phone,
       'address' : response.address,
       'isDoctor' : response.isDoctor,
       'specializations' : response.specializations,
       'hospitals' : response.hospitals
     }
   };
  }
};

// Model function for retrieving a user
UserModel.prototype.getUser = async function(userId, userIdInToken, email) {
  // Verify the authorization of the user
  if(helpers.isUserAuthorized(userId, userIdInToken)) {
    // Connect to the database
    await userAccessor.connectDatabase()
        .catch(err => {
          logger.error("[%s] Could not connect to the database, error: [%s]", email, err);
          throw {
            'statusCode' : statusCodes.INTERNAL_SERVER_ERROR,
            'body' : {
              'error' : 'Encountered an unexpected error while retrieving the user'
            }
          };
        });
    // Get the user document from the database
    var response = await userAccessor.getUser({'_id' : userId})
        .catch(err => {
          logger.error("[%s] Encountered an unexpected error while retrieving the user, error: [%s]", email, err);
          throw {
            'statusCode' : statusCodes.INTERNAL_SERVER_ERROR,
            'body' : {
              'error' : 'Encountered an unexpected error while retrieving the user'
            }
          };
        });
    if(response) {
      logger.info("[%s] Retrieved the user successfully, email: '%s'", email, response.email);
      // Return the user document as response, if it's found in the database
      return {
        'statusCode' : statusCodes.HTTP_OK,
        'body' : {
          'firstName' : response.firstName,
          'lastName' : response.lastName,
          'email' : response.email,
          'phone' : response.phone,
          'address' : response.address,
          'isDoctor' : response.isDoctor,
          'specializations' : response.specializations,
          'hospitals' : response.hospitals
        }
      };
    } else {
      // Return a bad request error if user document is not found in the database
      return {
        'statusCode' : statusCodes.BAD_REQUEST,
        'body' : {
          'error' : 'User doesn\'t exist'
        }
      };
    }
  } else {
    // Return an unauthorised user error
    return {
      'statusCode' : statusCodes.FORBIDDEN,
      'body' : {
        'error' : 'Unauthorised user'
      }
    };
  }
};

// Export the module
export default new UserModel();
