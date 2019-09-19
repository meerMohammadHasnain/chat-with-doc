/*
*
* Routes for '/users' path
*
*/

// Dependencies
import model from './../model/userModel';
import validators from './../util/validator';
import utilMiddlewares from './../util/utilMiddlewares';
import statusCodes from './../util/statusCodes';

// Export the module
export default function(router) {

  // Create a user
  router.post('/users', validators.createUserValidationMiddlewares(),
     async function(req, res) {
        await model.createUser(req.body)
             .then(response => {
               res.status(response.statusCode).send(response.body);
             })
             .catch(err => {
               res.status(err.statusCode).send(err.body);
             });
  });

  // Retrieve a user
  router.get('/users', validators.getUserValidationMiddlewares(),
     utilMiddlewares.verifyAuthentication(),
     async function(req, res) {
        await model.getUser(req.query.id, req.userIdInToken, req.userEmail)
             .then(response => {
               res.status(response.statusCode).send(response.body);
             })
            .catch(err => {
               res.status(err.statusCode).send(err.body);
             });
  });

  // Handle invalid method
  router.all('/users', function(req, res, next) {
    if(['POST', 'GET'].indexOf(req.method) == -1) {
      res.status(statusCodes.METHOD_NOT_ALLOWED)
         .send({'body' : 'Method not allowed'});
    } else {
      next();
    }
  });

  // Return the router
  return router;

};
