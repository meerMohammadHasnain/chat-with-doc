/*
*
* Validator functions
*
*/

// Dependencies
import {body, query, param} from 'express-validator';
import validator from './utilMiddlewares';

// Container function for validator
var Validator = function() {};

// Create user validaton middlewares
Validator.prototype.createUserValidationMiddlewares = function() {
  var middlewares = [];
  middlewares.push(body('firstName').isAlpha());
  middlewares.push(body('lastName').isAlpha());
  middlewares.push(body('password').isString().trim().isLength({'min' : 1}));
  middlewares.push(body('phone').isMobilePhone());
  middlewares.push(body('email').isEmail());
  middlewares.push(body('isDoctor').isBoolean());
  middlewares.push(body('specializations').exists().custom((value) => {
    return typeof(value) == 'object' && value instanceof Array;
  }));
  middlewares.push(body('hospitals').exists().custom((value) => {
    return typeof(value) == 'object' && value instanceof Array;
  }));
  middlewares.push(validator.validateRequest());
  return middlewares;
};

// Get user validaton middlewares
Validator.prototype.getUserValidationMiddlewares = function() {
  var middlewares = [];
  middlewares.push(query('id').isMongoId());
  middlewares.push(validator.validateRequest());
  return middlewares;
};

// Create token validation middlewares
Validator.prototype.createTokenValidationMiddlewares = function() {
  var middlewares = [];
  middlewares.push(body('email').isEmail());
  middlewares.push(body('password').isString().trim().isLength({'min' : 1}));
  middlewares.push(validator.validateRequest());
  return middlewares;
};

Validator.prototype.createChatValidationMiddlewares = function() {
  var middlewares = [];
  middlewares.push(body('senderId').isMongoId());
  middlewares.push(body('senderType').isString().custom((value) => {
    if(['PATIENT', 'DOCTOR'].indexOf(value) == -1) {
      return false;
    }
    return true;
  }));
  middlewares.push(body('receiverId').isMongoId());
  middlewares.push(body('message').isString().isLength({'min' : 1}));
  middlewares.push(body('timestamp').isNumeric());
  middlewares.push(validator.validateRequest());
  return middlewares;
};

Validator.prototype.getAllChatsValidationMiddlewares = function() {
  var middlewares = [];
  middlewares.push(param('userId').isMongoId());
  middlewares.push(query('isDoctor').isBoolean());
  middlewares.push(validator.validateRequest());
  return middlewares;
};

Validator.prototype.getChatsValidationMiddlewares = function() {
  var middlewares = [];
  middlewares.push(param('userId').isMongoId());
  middlewares.push(query('with').isMongoId());
  middlewares.push(query('isDoctor').isBoolean());
  middlewares.push(validator.validateRequest());
  return middlewares;
};

// Export the module
export default new Validator();
