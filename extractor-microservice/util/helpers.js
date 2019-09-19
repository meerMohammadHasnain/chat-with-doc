/*
*
* Helper functions for the application
*
*/

// Dependencies
import bcrypt from 'bcrypt';
import {config} from 'config';
import jwt from 'jsonwebtoken';

// Global constants for the module
const TOKEN_EXPIRATION_TIME = '3h';
const PROMISE_TIMEOUT_IN_MILLIS = 1000;

// Container function for helpers
var Helpers = function() {};

// Helper for hashing a string
Helpers.prototype.hash = async function(str) {
  var response = bcrypt.hash(str, config.saltRounds)
    .catch(err => {
      throw err;
    });
  return response;
};

// Helper to sign auth token
Helpers.prototype.signToken = function(payload) {
  return Promise.race([new Promise((resolve, reject) => {
    jwt.sign(payload, config.authTokenSecret, {
      'expiresIn' : TOKEN_EXPIRATION_TIME,
      'issuer' : config.authTokenIssuer
    }, (err, token) => {
      if(!err && token) {
        resolve(token);
      } else {
        reject(err);
      }
    });
  }), this.timeoutPromise(PROMISE_TIMEOUT_IN_MILLIS)]);
};

// Helper to verify auth token
Helpers.prototype.verifyToken = function(token) {
  return Promise.race([new Promise((resolve, reject) => {
    jwt.verify(token, config.authTokenSecret, {
      'expiresIn' : TOKEN_EXPIRATION_TIME,
      'issuer' : config.authTokenIssuer
    }, (err, decoded) => {
      if(!err && decoded) {
        resolve(decoded);
      } else {
        reject(err);
      }
    });
  }), this.timeoutPromise(PROMISE_TIMEOUT_IN_MILLIS)]);
};

// Helper to timeout a promise
Helpers.prototype.timeoutPromise = function(delay) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('Timeout error');
    }, delay);
  });
}

// Helper function to verify authorization of the user
Helpers.prototype.isUserAuthorized = function(userId, userIdInToken) {
  return userId === userIdInToken;
}

// Helper function for sorting userChats following Quick Sort approach
Helpers.prototype.sortUserChatsBasedOnTimestamps = function(userChats, left, right, sortOrder) {
  this.partitionFunction = sortOrder == 'ascending' ? this.partitionUserChatsForAscendingSortOrder
                                                   : this.partitionUserChatsForDescendingSortOrder;
  var index;
    if (userChats.length > 1) {
        index = this.partitionFunction(userChats, left, right);
        if (left < index - 1) {
            this.sortUserChatsBasedOnTimestamps(userChats, left, index - 1, sortOrder);
        }
        if (index < right) {
            this.sortUserChatsBasedOnTimestamps(userChats, index, right, sortOrder);
        }
    }
    return userChats;
}

// Helper function to partition the array and return the pivot (required
// in the implementation of Quick Sort for ascending sorting)
Helpers.prototype.partitionUserChatsForAscendingSortOrder = function(userChats, left, right) {
  var pivot = userChats[Math.floor((right + left) / 2)];
  var i = left, j = right;
    while (i <= j) {
        while (userChats[i].timestamp < pivot.timestamp) {
            i++;
        }
        while (userChats[j].timestamp > pivot.timestamp) {
            j--;
        }
        if (i <= j) {
            this.swapUserChats(userChats, i, j);
            i++;
            j--;
        }
    }
    return i;
};

// Helper function to partition the array and return the pivot (required
// in the implementation of Quick Sort for descending sorting)
Helpers.prototype.partitionUserChatsForDescendingSortOrder = function(userChats, left, right) {
  var pivot = userChats[Math.floor((right + left) / 2)];
  var i = left, j = right;
    while (i <= j) {
        while (userChats[i].timestamp > pivot.timestamp) {
            i++;
        }
        while (userChats[j].timestamp < pivot.timestamp) {
            j--;
        }
        if (i <= j) {
            this.swapUserChats(userChats, i, j);
            i++;
            j--;
        }
    }
    return i;
};

// Helper function to swap two elements of an array (required in the implementation of Quick Sort)
Helpers.prototype.swapUserChats = function(userChats, left, right) {
  var temp = userChats[left];
  userChats[left] = userChats[right];
  userChats[right] = temp;
};

// Export the module
export default new Helpers();
