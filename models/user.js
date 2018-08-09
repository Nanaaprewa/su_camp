const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['m', 'male', 'f', 'female']
  },
  education: {
    type: String,
    enum: ['bs', 'lp', 'up', 'jhs', 'shs', 'coll', 'none']
  },
  hobbies: [
    {
      type: String
    }
  ]
});

module.exports = mongoose.model('User', User);
