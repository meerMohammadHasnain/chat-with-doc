// Dependencies
import 'dotenv/config';
import path from 'path';

// Export the configuration object
export var config = {
 'envName' : process.env.NODE_ENV,
 'host' : '127.0.0.1',
 'port' : 1000,
 'microserviceName' : 'extractor_microservice',
 'mongodbInfo' : {
   'protocol' : 'mongodb',
   'host' : '127.0.0.1',
   'port' : 27017,
   'dbName' : '/chatWithDocDB'
 },
 'redisInfo' : {
   'protocol' : 'http',
   'host' : '127.0.0.1',
   'port' : 6379
 },
 'consulInfo' : {
   'protocol': 'http',
   'consulHost' : '127.0.0.1',
   'consulPort' : 8500,
   'apiPath' : '/v1/agent/service/register',
   'registeredServiceId' : 'extractor_microservice'
 },
 'logFileName' : path.join(__dirname, "/../.logs/extractor_microservice.log"),
 'saltRounds' : 10,
 'authTokenIssuer' : 'www.chatwithdoc.com',
 'authTokenSecret' : process.env.AUTH_TOKEN_SECRET
};
