/*
*
*  Deals with the registration of microservice in Consul
*
*/

// Dependencies
import {config} from 'config';
import url from 'url';
import request from 'request';
import logger from './logger';
import statusCodes from './statusCodes';

// Global constants for the module
const PROTOCOL = 'http';
const HEARTBEAT_ROUTE = '/heartbeat';
const GENERIC_CHECK_ID = 'api';
const GENERIC_CHECK_NAME = 'service_heartbeat_check';
const CHECK_INTERVAL = '30s';
const CHECK_TIMEOUT = '2s';
const DEREGISTRATION_INTERVAL = '10s';
const REQUEST_TIMEOUT_IN_MILLIS = 2000;

// Container function for utility middlewares
var Register = function() {};

// Register the microservice
Register.prototype.registerService = function() {
  // Creating request options object to hit Consul API
  var requestOptions = this.createRequestOptions();
  // Hitting Consul API to register the microservice instance
  this.hitConsulApi(requestOptions)
       .then(response => {
         logger.info("HTTPS service instance registered successfully in Consul, serviceID: %s",
          config.consulInfo.registeredServiceId);
       }, err => {
         logger.warn("Could not register the HTTPS service instance in Consul, skipping it");
       })
       .catch(err => {
         logger.warn("Could not register the HTTPS service instance in Consul, skipping it");
       });
};

// Send the request to Consul API
Register.prototype.hitConsulApi = function(requestOptions) {
  return new Promise((resolve, reject) => {
    // Hit a PUT request to Consul API to register the service
    request.put(requestOptions, (err, res, body) => {
      if(!err) {
        if(res.statusCode == statusCodes.HTTP_OK) {
          resolve();
        } else {
          reject();
        }
      } else {
        reject();
      }
    });
  });
};

// Create the request options
Register.prototype.createRequestOptions = function() {
  var consulUrl = url.format({
    'protocol' : config.consulInfo.protocol,
    'hostname' : config.consulInfo.consulHost,
    'port' : config.consulInfo.consulPort,
    'pathname' : config.consulInfo.apiPath
  });
  var serviceUrl = url.format({
    'protocol' : PROTOCOL,
    'hostname' : config.host,
    'port' : config.port,
    'pathname' : HEARTBEAT_ROUTE
  });
  return {
    'url' : consulUrl,
    'json' : {
      'ID' : config.consulInfo.registeredServiceId,
      'Name' : config.microserviceName,
      'Address': config.host,
      'Port': config.port,
      'Check': {
       'ID': GENERIC_CHECK_ID,
       'Name': GENERIC_CHECK_NAME,
       'HTTP': serviceUrl,
       'Method': 'GET',
       'Interval': CHECK_INTERVAL,
       'Timeout': CHECK_TIMEOUT,
       'DeregisterCriticalServiceAfter': DEREGISTRATION_INTERVAL
     }
   },
   'timeout' : REQUEST_TIMEOUT_IN_MILLIS
  };
};

// Export the module
export default new Register();
