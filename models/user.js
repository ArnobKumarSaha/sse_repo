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
  /*
  cart: {
    myFiles: {
      type: String,
      required: true 
    }
  },*/

  cart: {
    myFiles: [
      {
        filePath: { type: String, required: true },
        keyword: {type: String, required: true}
      }
    ]
  }
});


userSchema.methods.addToCart = function(filePath, keyword) {
  const updatedFileItems = [...this.cart.myFiles];

  updatedFileItems.push({
    filePath: filePath,
    keyword: keyword
  });
  const updatedCart = {
    myFiles: updatedFileItems
  };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.deleteFromCart = function(filePath){
  const updatedCartItems = this.cart.myFiles.filter(item => {
    return item.filePath !== filePath;
  });
  this.cart.myFiles = updatedCartItems;
  return this.save();
}

module.exports = mongoose.model('User', userSchema);