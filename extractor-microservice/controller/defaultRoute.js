/*
*
* Default route for invalid paths
*
*/

// Dependency
import statusCodes from './../util/statusCodes';

// Export the module
export default function(router) {
  router.all('/', (req, res) => {
    res.status(statusCodes.BAD_REQUEST)
       .send({'body' : 'Resource not found'});
  });
  return router;
};
