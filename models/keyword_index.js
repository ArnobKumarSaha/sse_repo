const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const indexSchema = new Schema({
  index_hash: {
    type: String,
    required: true
  },
  whereItIs: {
    myFiles: [
      {
        filePath: { type: String, required: true }
      }
    ]
  }
});

module.exports = mongoose.model('Keyword-Index', indexSchema);