/*
*
* Routes for '/chats' path
*
*/

// Dependencies
import model from './../model/chatModel';
import validators from './../util/validator';
import utilMiddlewares from './../util/utilMiddlewares';
import statusCodes from './../util/statusCodes';

// Export the module
export default function(router) {

  // Create a chat
  router.post('/chats', validators.createChatValidationMiddlewares(),
     utilMiddlewares.verifyAuthentication(),
     async function(req, res) {
        await model.createChat(req.body, req.userIdInToken, req.userEmail)
             .then(response => {
               res.status(response.statusCode).send(response.body);
             })
             .catch(err => {
               res.status(err.statusCode).send(err.body);
             });
  });

  // Retrieve all chat for a user (patient/ doctor)
  router.get('/chats/all/:userId', validators.getAllChatsValidationMiddlewares(),
     utilMiddlewares.verifyAuthentication(),
     async function(req, res) {
        await model.getAllChatsForUser(req.params.userId,
                                 req.query.isDoctor,
                                 req.userIdInToken,
                                 req.userEmail)
             .then(response => {
               res.status(response.statusCode).send(response.body);
             })
            .catch(err => {
               res.status(err.statusCode).send(err.body);
             });
  });

  // Retrieve chats between a patient and a doctor
  router.get('/chats/:userId', validators.getChatsValidationMiddlewares(),
     utilMiddlewares.verifyAuthentication(),
     async function(req, res) {
        await model.getAllChatsBetweenPatientAndDoctor(req.params.userId,
                                  req.query.with,
                                  req.query.isDoctor,
                                  req.userIdInToken,
                                  req.userEmail)
             .then(response => {
               res.status(response.statusCode).send(response.body);
             })
            .catch(err => {
               res.status(err.statusCode).send(err.body);
             });
  });

  // Handle invalid method for '/chats/all' route
  router.all('/chats/all', function(req, res, next) {
    if(['GET'].indexOf(req.method) == -1) {
      res.status(statusCodes.METHOD_NOT_ALLOWED)
         .send({'body' : 'Method not allowed'});
    } else {
      next();
    }
  });

  // Handle invalid method for '/chats' route
  router.all('/chats', function(req, res, next) {
    if(['POST'].indexOf(req.method) == -1) {
      res.status(statusCodes.METHOD_NOT_ALLOWED)
         .send({'body' : 'Method not allowed'});
    } else {
      next();
    }
  });

  // Return the router
  return router;

};
