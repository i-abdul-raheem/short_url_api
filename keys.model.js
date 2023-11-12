const schema = require('mongoose').Schema;
const model = require('mongoose').model;

const keys = schema({
  url: {
    type: String,
    required: true,
  },
  key: {
    type: String,
    required: true,
    unique: true,
  },
});

const Keys = model('keys', keys);
module.exports = { Keys };
