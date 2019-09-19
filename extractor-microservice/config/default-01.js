// Dependencies
import 'dotenv/config';
import path from 'path';

// Export the configuration object
export var config = {
  'port' : 1001,
  'consulInfo' : {
    'registeredServiceId' : 'extractor_microservice_01'
  },
  'logFileName' : path.join(__dirname, "/../.logs/extractor_microservice01.log")
};
