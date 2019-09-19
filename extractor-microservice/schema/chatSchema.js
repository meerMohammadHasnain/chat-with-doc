/*
*
* Deals with chat schema
*
*/

// Dependency
import mongoose from 'mongoose';

// Chat schema
var chatSchema = new mongoose.Schema({
  // Define schema properties
  'senderId' : {
    'type': 'String',
    'required' : true,
    'trim' : true
  },
   'senderType' : {
    'type': 'String',
    'required' : true,
    'trim' : true
  },
   'receiverId' : {
    'type': 'String',
    'required' : true,
    'trim' : true
  },
   'message' : {
    'type': 'String',
    'required' : true,
    'trim' : true
  },
   'timestamp' : {
    'type': 'Number',
    'required' : true
  }
});

// Export the module
export default mongoose.model('chat', chatSchema);
