/*
*
* Route for '/token' path
*
*/

// Dependencies
import model from './../model/tokenModel';
import validators from './../util/validator';
import statusCodes from './../util/statusCodes';

// Export the module
export default function(router) {

  // Create a token
  router.post('/token', validators.createTokenValidationMiddlewares(),
     async function(req, res) {
        await model.createAuthToken(req.body)
           .then(response => {
             res.status(response.statusCode).send(response.body);
           })
           .catch(err => {
             res.status(err.statusCode).send(err.body);
           });
  });

  // Handle invalid method
  router.all('/token', function(req, res, next) {
    if(['POST'].indexOf(req.method) == -1) {
      res.status(statusCodes.METHOD_NOT_ALLOWED).send({'body' : 'Method not allowed'});
    } else {
      next();
    }
  });

  // Return the router
  return router;

};
