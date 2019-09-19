// Dependencies
import 'dotenv/config';
import path from 'path';

// Export the configuration module
export var config = {
  'port' : 1008,
  'consulInfo' : {
    'registeredServiceId' : 'extractor_microservice_01'
  },
  'logFileName' : path.join(__dirname, "/../.logs/extractor_microservice01.log")
};
