// Dependencies
import 'dotenv/config';
import path from 'path';

// Export the configuration module
export var config = {
 'host' : '127.0.0.1',
 'port' : 1010,
 'mongodbInfo' : {
   'host' : '127.0.0.1',
   'port' : 27017
  },
  'redisInfo' : {
    'protocol' : 'http',
    'host' : '127.0.0.1',
    'port' : 6379
  },
 'consulInfo' : {
   'consulHost' : '127.0.0.1',
   'consulPort' : 8500
 },
 'logFileName' : path.join(__dirname, "/../.logs/extractor_microservice.log")
};
