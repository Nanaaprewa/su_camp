const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const debug = require('debug')('su-camp:models/house.js');

let House = new Schema({
  name: { type: String, required: true },
  occupants: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  gender: [
    {
      type: String,
      required: true,
      enum: ['m', 'male', 'f', 'female']
    }
  ],
  max_capacity: Number
});

module.exports = mongoose.model('House', House);
