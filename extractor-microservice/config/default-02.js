// Depedencies
import 'dotenv/config';
import path from 'path';

// Export the configuration object
export var config = {
  'port' : 1002,
  'consulInfo' : {
    'registeredServiceId' : 'extractor_microservice_02'
  },
  'logFileName' : path.join(__dirname, "/../.logs/extractor_microservice02.log")
};
