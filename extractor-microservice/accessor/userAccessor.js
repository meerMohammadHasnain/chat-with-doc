/*
*
* Deals with user data access from the database
*
*/

// Dependencies
import mongoose from 'mongoose';
import {config} from 'config';
import url from 'url';
import Model from './../schema/userSchema';
import logger from './../util/logger';

// Global constants for the module
const CONNECT_TIMEOUT_MS = 1000;
const SOCKET_TIMEOUT_MS = 1000;

// Container function for accessor methods
var UserAccessor = function() {
  this.connectionUrl = url.format({
    'protocol' : config.mongodbInfo.protocol,
    'hostname' : config.mongodbInfo.host,
    'port' : config.mongodbInfo.port,
    'pathname' : config.mongodbInfo.dbName,
    'slashes' : true
  });
};

// Connect to the database
UserAccessor.prototype.connectDatabase = async function() {
  var response = await mongoose.connect(this.connectionUrl, {
    'useNewUrlParser' : true,
    'connectTimeoutMS' : CONNECT_TIMEOUT_MS,
    'socketTimeoutMS' : SOCKET_TIMEOUT_MS
  }).catch(err => {
    throw err;
  });
  return;
};

// Create a user
UserAccessor.prototype.createUser = async function(userData) {
  var document = new Model(userData);
  var response = await document.save()
        .catch(err => {
          mongoose.connection.close();
          throw err;
        });
  mongoose.connection.close();
  return response;
};

// Get a user
UserAccessor.prototype.getUser = async function(filter) {
  var response = await Model.findOne(filter)
     .catch(err => {
       mongoose.connection.close();
       throw err;
     });
  mongoose.connection.close();
  return response;
};

// Get names of users
UserAccessor.prototype.getUserNames = async function(filter, projection) {
  var response = await Model.find(filter, projection)
     .catch(err => {
       mongoose.connection.close();
       throw err;
     });
  mongoose.connection.close();
  return response;
}

// Export the module
export default new UserAccessor();
