/*
*
* Heartbeat route to check health status of the microservice
*
*/

// Dependency
import statusCodes from './../util/statusCodes';

// Export the module
export default function(router) {

  // Get the status of the microservice
  router.get('/heartbeat', (req, res) => {
    res.sendStatus(statusCodes.HTTP_OK);
  });

  // Handle invalid method
  router.all('/heartbeat', function(req, res, next) {
    if(['GET'].indexOf(req.method) == -1) {
      res.status(statusCodes.METHOD_NOT_ALLOWED)
         .send({'body' : 'Method not allowed'});
    } else {
      next();
    }
  });

  //Return the router
  return router;
};
