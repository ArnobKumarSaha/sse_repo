const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  cart: {
    myFiles: [
      {
        myFileId: {type: Schema.Types.ObjectId, required: true}
      }
    ]
  },
  reqs: {
    notifications: [
      {
        requesterId: {type: Schema.Types.ObjectId, required: true},
        requestedFileId: {type: Schema.Types.ObjectId, required: true}
      }
    ]
  }
});


userSchema.methods.addToCart = function(fileId) {
  const updatedFileItems = [...this.cart.myFiles];

  updatedFileItems.push({
    myFileId: fileId
  });
  const updatedCart = {
    myFiles: updatedFileItems
  };
  this.cart = updatedCart;

  return this.save();
};

userSchema.methods.deleteFromCart = function(fileId){
  const updatedCartItems = this.cart.myFiles.filter(item => {
    return item.myFileId != fileId;
  });
  this.cart.myFiles = updatedCartItems;
  return this.save();
}

module.exports = mongoose.model('User', userSchema);