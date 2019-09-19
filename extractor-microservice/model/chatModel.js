/*
*
* Model for chat entity
*
*/

// Dependencies
import chatAccessor from './../accessor/chatAccessor';
import userAccessor from './../accessor/userAccessor';
import logger from './../util/logger';
import Model from './../schema/chatSchema';
import UserModel from './../schema/userSchema';
import helpers from './../util/helpers';
import statusCodes from './../util/statusCodes';

// Container function for user model
var ChatModel = function() {};

// Model function for creating a chat
ChatModel.prototype.createChat = async function(chatData, userIdInToken, email) {
  // Verify the authorization of the user
  if(helpers.isUserAuthorized(chatData.senderId, userIdInToken)) {
    // Create a chat object in Mongo DB
    var chatObject = await this.insertChatIntoMongo(chatData, email)
        .catch(err => {
          throw err;
        });
    // Insert the chatId in Redis
    await this.insertChatIdIntoRedis(chatObject, chatObject.timestamp, email)
         .catch(err => {
           throw err;
         });
    // Return the response
    return {
      'statusCode' : statusCodes.CREATED,
      'body' : chatObject
    };
  } else {
    // Return an unauthorised user error
    return {
      'statusCode' : statusCodes.FORBIDDEN,
      'body' : {
        'error' : 'Unauthorised user'
      }
    };
  }
}

// Supportive function for creating a chat object in Mongo DB
ChatModel.prototype.insertChatIntoMongo = async function(chatData, email) {
  // Connect to the Mongo DB for storing the chat object
  await chatAccessor.connectDatabase()
      .catch(err => {
        logger.error("[%s] Could not connect to the database, error: [%s]", email, err);
        throw {
          'statusCode' : statusCodes.INTERNAL_SERVER_ERROR,
          'body' : {
            'error' : 'Encountered an unexpected error while creating the chat'
          }
        };
      });
   // Check if the receiver exists
   var isReceiverExisting = await UserModel.exists({'_id' : chatData.receiverId})
       .catch(err => {
         logger.error("[%s] Encountered an unexpected error while creating the chat, error: [%s]",
                       email,
                       err);
         throw {
           'statusCode' : statusCodes.INTERNAL_SERVER_ERROR,
           'body' : {
             'error' : 'Encountered an unexpected error while creating the chat'
           }
        };
       });
  // Throw bad request error if the receiver doesn't exist
   if(!isReceiverExisting) {
     throw {
       'statusCode' : statusCodes.BAD_REQUEST,
       'body' : {
         'error' : 'The receiver does not exist'
       }
     };
   }
   // Create the user document in the database
   var response = await chatAccessor.createChatInMongo(chatData)
       .catch(err => {
         logger.error("[%s] Could not create the chat in Mongo DB, error: [%s]", email, err);
         throw {
          'statusCode' : statusCodes.INTERNAL_SERVER_ERROR,
          'body' : {
                 'error' : 'Could not create the chat'
          }
       };
   });
   // Log creation of chat in Mong DB
   logger.info("[%s] Created the chat successfully in Mongo DB, chatId: '%s'", email, response['_id']);
   return response;
};

// Supportive function for inserting a chatId into Redis
ChatModel.prototype.insertChatIdIntoRedis = async function(chatData, timestamp, email) {
  // Create Redis client
  var redisClient = await chatAccessor.createRedisClient()
   .catch(async (err) => {
      logger.error("[%s] Could not connect to Redis for insering chatId '%s', error: [%s]", email, chatData['_id'], err);
      // Rollback partial chat action by deleting the chat object from Mongo DB
      await this.deleteChatObjectFromMongo(chatData['_id'], email)
                .catch(err => {});
      // Throw an internal server error back to the requester
      throw {
        'statusCode' : statusCodes.INTERNAL_SERVER_ERROR,
        'body' : {
           'error' : 'Encountered an unexpected error while creating the chat'
        }
      };
    });
   // Define the key of sorted set for storing the chatId in Redis
   var key = chatData.senderType == 'PATIENT'
             ? 'CHATS_BETWEEN_'.concat(chatData.senderId, '_', chatData.receiverId)
             : 'CHATS_BETWEEN_'.concat(chatData.receiverId, '_', chatData.senderId);
   // Insert the chatId in asorted set in Redis
   await chatAccessor.insertChatIdIntoRedis(redisClient, key, chatData['_id'].toString(), timestamp)
      .catch(async (err) => {
        logger.error("[%s] Could not insert chatId '%s' in Redis, error: [%s]", email, chatData['_id'], err);
        // Rollback partial chat action by deleting the chat object from Mongo DB
        await this.deleteChatObjectFromMongo(chatData['_id'], email)
                  .catch(err => {});
        // Throw an internal server error back to the requester
        throw {
         'statusCode' : statusCodes.INTERNAL_SERVER_ERROR,
         'body' : {
            'error' : 'Could not create the chat'
         }
        };
     });
   // Log the successful creation of chat
   logger.info("[%s] Inserted the chatId successfully in Redis, chatId: '%s'", email, chatData['_id']);
   // Return
   return;
};

// Supportive function for rolling back partial creation of chat
ChatModel.prototype.deleteChatObjectFromMongo = async function(chatId, email) {
  // Connect to the Mongo DB for deletig the chat object
  await chatAccessor.connectDatabase()
    .catch(err => {
      logger.error(
        "[%s] Could not connect to the database for rolling back the creation of chat object, error: [%s]", email, err);
      throw err;
    });
  // Rollback the creation of chat object by deleting it
  var response = await chatAccessor.deleteChatFromMongo({'_id' : chatId})
      .catch(err => {
        logger.error("[%s] Could not roll-back the creation of chat object in Mongo DB, error: [%s]", email, err);
        throw err;
      });
  logger.info("[%s] Rolled back the action by deleting the chat object from Mongo DB, chatId: %s", email, chatId);
  return;
};

// Model function for retrieving all chats for a user (patient/ doctor)
ChatModel.prototype.getAllChatsForUser = async function(userId, isDoctor, userIdInToken, email) {
  // Verify the authorization of the user
  if(helpers.isUserAuthorized(userId, userIdInToken)) {
    // Fetch all the successful chats for the user
    var userChats = await this.fetchSuccessfulChatsForUser(userId, isDoctor, email)
            .catch(err => {
              throw err;
            });
    // Log the successful fetch of user chats
    logger.info("[%s] Successfully fetched all the chats for the user, userId: '%s'", email, userId);
    // Return user chats
    return {
      'statusCode' : statusCodes.HTTP_OK,
      'body' : {
        'successfulChats' : userChats
      }
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

// Supportive function for fetching successful chats of the user
ChatModel.prototype.fetchSuccessfulChatsForUser = async function(userId, isDoctor, email) {
  // Define the key pattern to be queried for in Redis
  var keyPattern = isDoctor == 'true' ? 'CHATS_BETWEEN_'.concat('*_', userId) : 'CHATS_BETWEEN_'.concat(userId, '_*');
  // Create Redis client
  var redisClient = await chatAccessor.createRedisClient()
   .catch(async (err) => {
      logger.error(
        "[%s] Could not connect to Redis for fetching chats for the user, userId: '%s', error: [%s]",
        email,
        userId,
        err
      );
      // Throw an internal server error back to the requester
      throw {
        'statusCode' : statusCodes.INTERNAL_SERVER_ERROR,
        'body' : {
           'error' : 'Encountered an unexpected error while fetching the chats'
        }
      };
    });
  // Get the array of keys matching the key pattern
  var matchedKeys = await chatAccessor.getMatchingKeysFromRedis(redisClient, keyPattern)
     .catch(err => {
       logger.error(
         "[%s] Encountered an unexpected error while fetching chats for the user, userId: '%s', error: [%s]",
         email,
         userId,
         err
       );
       // Throw an internal server error back to the requester
       throw {
         'statusCode' : statusCodes.INTERNAL_SERVER_ERROR,
         'body' : {
            'error' : 'Encountered an unexpected error while fetching the chats'
         }
       };
     });
  // Fetch chatId of the latest chat of the user with each of the interlocutors along with the interlocutorId
  var userChats = await this.fetchChatDetailsFromRedis(userId, redisClient, matchedKeys, isDoctor, email)
     .catch(err => {
       throw err;
     });
  // Close the connection to Redis
  redisClient.quit();
  // Add interlocutor name for all the interlocutors in userChats
  await this.fetchInterlocutorNames(userChats, email)
            .catch(err => {
              throw err;
            });
  // Add chat message and timestamp for each chat in userChats
  await this.fetchChatMessageAndTimestamp(userChats, email)
            .catch(err => {
              throw err;
            });
  // Sort userChats on the basis of timestamp of the chats (in descending order)
  helpers.sortUserChatsBasedOnTimestamps(userChats, 0, userChats.length - 1, 'descending');
  // Return the sorted userChats array
  return userChats;
};

// Supportive function for fetching chat details from Redis
ChatModel.prototype.fetchChatDetailsFromRedis = async function(userId, redisClient, matchedKeys, isDoctor, email) {
  // Define the object for holding chatId and timestamp for the latest chat in each key
  var userChats = [];
  // Iterate over matchedKeys array
  for(let key of matchedKeys) {
    // Define the chatDetails object
    var chatDetails = {};
    // Get chatId of the latest chat
    chatDetails.chatId = await chatAccessor.fetchLatestChatIdFromRedis(redisClient, key)
          .catch(err => {
            redisClient.quit();
            logger.error(
              "[%s] Encountered an unexpected error while fetching chats for the user, userId: '%s', error: [%s]",
              email,
              userId,
              err
            );
            // Throw an internal server error back to the requester
            throw {
              'statusCode' : statusCodes.INTERNAL_SERVER_ERROR,
              'body' : {
                 'error' : 'Encountered an unexpected error while fetching the chats'
              }
            };
          });
    // Get the interlocutor id from the key
    var splittedKey = key.split('_');
    chatDetails.interlocutorId = isDoctor == 'true' ? splittedKey[2] : splittedKey[3];
    // Push chatDetails into userChats array
    userChats.push(chatDetails);
  }
  // Return userChats
  return userChats;
};

// Supportive function for fetching interlocutor names
ChatModel.prototype.fetchInterlocutorNames = async function(userChats, email) {
  // Map userChats to an array of interlocutorIds
  var interlocutorIds = userChats.map((chatDetails) => {
    return chatDetails.interlocutorId;
  });
  // Connect to Mongo DB
  await userAccessor.connectDatabase()
      .catch(err => {
        logger.error("[%s] Could not connect to the database for fetching user names, error: [%s]", email, err);
        throw {
          'statusCode' : statusCodes.INTERNAL_SERVER_ERROR,
          'body' : {
            'error' : 'Encountered an unexpected error while fetching the chats'
          }
        };
  });
  // Get firstName and lastName of the interlocutor
  var interlocutorNames = await userAccessor.getUserNames({'_id' : {'$in' : interlocutorIds}}, {'_id' : 1, 'firstName' : 1, 'lastName' : 1})
         .catch(err => {
           logger.error("[%s] Could not fetch user names from the database, error: [%s]", email, err);
           throw {
             'statusCode' : statusCodes.INTERNAL_SERVER_ERROR,
             'body' : {
               'error' : 'Encountered an unexpected error while fetching the chats'
             }
           };
         });
  // Update userChats object
  userChats = userChats.map((chatDetails) => {
    var interlocutorObject = interlocutorNames.find((interlocutor) => {
      return interlocutor['_id'] == chatDetails.interlocutorId;
    });
    chatDetails.interlocutorName = interlocutorObject.firstName.concat(' ', interlocutorObject.lastName);
  });
  return userChats;
};

// Supportive function for fetching chat messages and timestamps
ChatModel.prototype.fetchChatMessageAndTimestamp = async function(userChats, email) {
  // Map userChats to an array of chatIds
  var chatIds = userChats.map((chatDetails) => {
    return chatDetails.chatId;
  });
  // Connect to Mongo DB
  await chatAccessor.connectDatabase()
      .catch(err => {
        logger.error("[%s] Could not connect to the database for fetching chat messsages and timestamps, error: [%s]", email, err);
        throw {
          'statusCode' : statusCodes.INTERNAL_SERVER_ERROR,
          'body' : {
            'error' : 'Encountered an unexpected error while fetching the chats'
          }
        };
  });
  // Get chat message and timestamp of the chats
  var chatMessagesAndTimestamps = await chatAccessor.fetchChatDetails({'_id' : {'$in' : chatIds}}, {'_id' : 1, 'message' : 1, 'timestamp' : 1})
       .catch(err => {
         logger.error("[%s] Could not fetch chat messages and timestamps from the database, error: [%s]", email, err);
         throw {
          'statusCode' : statusCodes.INTERNAL_SERVER_ERROR,
          'body' : {
            'error' : 'Encountered an unexpected error while fetching the chats'
          }
       };
  });
  // Update userChats object
  userChats = userChats.map((chatDetails) => {
    var chatObject = chatMessagesAndTimestamps.find((chatInfo) => {
      return chatInfo['_id'] == chatDetails.chatId;
    });
    chatDetails.message = chatObject.message;
    chatDetails.timestamp = chatObject.timestamp;
  });
  return userChats;
};

ChatModel.prototype.getAllChatsBetweenPatientAndDoctor = async function(userId,
                                                     interactedWith,
                                                     isDoctor,
                                                     userIdInToken,
                                                     email) {
  if(helpers.isUserAuthorized(userId, userIdInToken)) {
    // Define the key to be queried in Redis
    var key = isDoctor == 'true' ? 'CHATS_BETWEEN_'.concat(interactedWith, '_', userId)
                                        : 'CHATS_BETWEEN_'.concat(userId, '_', interactedWith);
    // Create Redis client
    var redisClient = await chatAccessor.createRedisClient()
     .catch(async (err) => {
        logger.error(
          "[%s] Could not connect to Redis for fetching chats between the users '%s' and '%s', error: [%s]",
          email,
          userId,
          interactedWith,
          err
        );
        // Throw an internal server error back to the requester
        throw {
          'statusCode' : statusCodes.INTERNAL_SERVER_ERROR,
          'body' : {
             'error' : 'Encountered an unexpected error while fetching the chats between the users'
          }
        };
      });
      // Fetch all chatIds between the two desired users from Redis
      var chatIds = await chatAccessor.fetchAllChatIdsBetweenUsers(redisClient, key)
                      .catch(err => {
                        logger.error(
                          "[%s] Could not fetch chats between the users '%s' and '%s' from Redis, error: [%s]",
                          email,
                          userId,
                          interactedWith,
                          err
                        );
                        // Throw an internal server error back to the requester
                        throw {
                          'statusCode' : statusCodes.INTERNAL_SERVER_ERROR,
                          'body' : {
                             'error' : 'Encountered an unexpected error while fetching chats between the users'
                          }
                        };
                      });
      // Connect to Mongo DB for fetching chat details
      await chatAccessor.connectDatabase()
          .catch(err => {
            logger.error("[%s] Could not connect to the database for fetching chats between users '%s' and '%s', error: [%s]", email, userId, interlocutorId, err);
            throw {
              'statusCode' : statusCodes.INTERNAL_SERVER_ERROR,
              'body' : {
                'error' : 'Encountered an unexpected error while fetching the chats between users'
              }
            };
          });
      // Check if the receiver exists
      var isReceiverExisting = await UserModel.exists({'_id' : interactedWith})
           .catch(err => {
             logger.error("[%s] Encountered an unexpected error while creating the chat, error: [%s]",
                           email,
                           err);
             throw {
               'statusCode' : statusCodes.INTERNAL_SERVER_ERROR,
               'body' : {
                 'error' : 'Encountered an unexpected error while creating the chat'
               }
            };
      });
      // Throw bad request error if the receiver doesn't exist
      if(!isReceiverExisting) {
         throw {
           'statusCode' : statusCodes.BAD_REQUEST,
           'body' : {
             'error' : 'The interlocutor does not exist'
           }
         };
      }
      // Query chatIds in Mongo DB to fetch chat details
      var chats = await chatAccessor.fetchChatDetails({'_id' : {'$in' : chatIds}}, {'_id' : 1, 'senderId' : 1, 'message' : 1, 'timestamp' : 1})
                   .catch(err => {
                     logger.error(
                       "[%s] Could not fetch chats between the users '%s' and '%s' from Redis, error: [%s]",
                       email,
                       userId,
                       interactedWith,
                       err
                     );
                     // Throw an internal server error back to the requester
                     throw {
                       'statusCode' : statusCodes.INTERNAL_SERVER_ERROR,
                       'body' : {
                          'error' : 'Encountered an unexpected error while fetching the chats between the users'
                       }
                     };
                   });
      // Sort chats on the basis of timestamp of the chats (in ascending order)
      helpers.sortUserChatsBasedOnTimestamps(chats, 0, chats.length - 1, 'ascending');
      // Log the successful fetch of chats between the users
      logger.info("[%s] Successfully fetched all the chats between the users '%s' and '%s'", email, userId, interactedWith);
      // Return the response
      return {
        'statusCode' : statusCodes.HTTP_OK,
        'body' : chats
      };
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
export default new ChatModel();
