/*
*
* Deals with chat data access from the database
*
*/

// Dependencies
import mongoose from 'mongoose';
import redis from 'redis';
import {promisify} from 'util';
import {config} from 'config';
import url from 'url';
import Model from './../schema/chatSchema';
import logger from './../util/logger';

// Global constants for the module
const CONNECT_TIMEOUT_MS = 1000;
const SOCKET_TIMEOUT_MS = 1000;

// Container function for accessor methods
var ChatAccessor = function() {
  // Connection URL for Mongo DB
  this.connectionUrl = url.format({
    'protocol' : config.mongodbInfo.protocol,
    'hostname' : config.mongodbInfo.host,
    'port' : config.mongodbInfo.port,
    'pathname' : config.mongodbInfo.dbName,
    'slashes' : true
  });
};

// Connect to Mongo DB
ChatAccessor.prototype.connectDatabase = async function() {
  var response = await mongoose.connect(this.connectionUrl, {
    'useNewUrlParser' : true,
    'connectTimeoutMS' : CONNECT_TIMEOUT_MS,
    'socketTimeoutMS' : SOCKET_TIMEOUT_MS
  }).catch(err => {
    throw err;
  });
  return;
};

// Connect to Redis and create a Redis client
ChatAccessor.prototype.createRedisClient = async function() {
  return new Promise((resolve, reject) => {
    var client = redis.createClient({
      'host' : config.redisInfo.host,
      'port' : config.redisInfo.port,
      'connect_timeout' : CONNECT_TIMEOUT_MS
    });
    client.on('ready', () => {
      resolve(client);
    });
    client.on('error', (err) => {
      reject(err);
    });
  });
};

// Create a chat object in Mongo DB
ChatAccessor.prototype.createChatInMongo = async function(chatData) {
  var document = new Model(chatData);
  var response = await document.save()
        .catch(err => {
          mongoose.connection.close();
          throw err;
        });
  mongoose.connection.close();
  return response;
};

// Delete a chat object from Mongo DB
ChatAccessor.prototype.deleteChatFromMongo = async function(filter) {
  var response = await Model.deleteOne(filter)
        .catch(err => {
          mongoose.connection.close();
          throw err;
        });
  mongoose.connection.close();
  return response;
};

ChatAccessor.prototype.insertChatIdIntoRedis = async function(client, key, chatId, timestamp) {
  // Promisifying insertion into Redis
  var getAsync = promisify(client.zadd).bind(client);
  // Insert the chatId in a sorted set in Redis
  await getAsync(key, timestamp, chatId)
         .catch(err => {
           client.quit();
           throw err;
         });
  client.quit();
  return;
}

ChatAccessor.prototype.getMatchingKeysFromRedis = async function(client, keyPattern) {
  // Promisifying keys method
  var getAsync = promisify(client.keys).bind(client);
  // Retrieve all the keys that match the keyPattern
  var matchedKeys = await getAsync(keyPattern)
         .catch(err => {
           client.quit();
           throw err;
         });
  return matchedKeys;
};

ChatAccessor.prototype.fetchLatestChatIdFromRedis = async function(client, key) {
  // Promisifying zrange method
  var getAsync = promisify(client.zrange).bind(client);
  // Retrive the last element of the sorted symbolised by the key
  var response = await getAsync(key, -1, -1)
         .catch(err => {
           client.quit();
           throw err;
         });
  return response[0];
};

ChatAccessor.prototype.fetchChatDetails = async function(filter, projection) {
  var response = await Model.find(filter, projection)
     .catch(err => {
       mongoose.connection.close();
       throw err;
     });
  mongoose.connection.close();
  return response;
};

ChatAccessor.prototype.fetchAllChatIdsBetweenUsers = async function(client, key) {
  // Promisifying zrange method
  var getAsync = promisify(client.zrange).bind(client);
  // Retrive the last element of the sorted symbolised by the key
  var response = await getAsync(key, 0, -1)
         .catch(err => {
           client.quit();
           throw err;
         });
  client.quit();
  return response;
};

// Export the module
export default new ChatAccessor();
