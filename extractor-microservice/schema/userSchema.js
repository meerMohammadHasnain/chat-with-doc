/*
*
* Deals with user schema
*
*/

// Dependency
import mongoose from 'mongoose';

// User schema
var userSchema = new mongoose.Schema({
  // Define schema properties
  'firstName' : {
    'type': 'String',
    'required' : true,
    'trim' : true
  },
   'lastName' : {
    'type': 'String',
    'required' : true,
    'trim' : true
  },
   'email' : {
    'type': 'String',
    'required' : true,
    'trim' : true
  },
   'phone' : {
    'type': 'Number',
    'required' : true,
    'trim' : true
  },
   'password' : {
    'type': 'String',
    'required' : true,
    'trim' : true
  },
  'isDoctor' : {
    'type' : 'Boolean',
    'required' : true
  },
  'specializations' : {
    'type' : [String],
    'required' : true
  },
  'hospitals' : {
    'type' : [String],
    'required' : true
  }
});

// Export the module
export default mongoose.model('user', userSchema);
