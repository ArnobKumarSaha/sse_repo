const User = require('../models/user');
const KeywordIndex = require('../models/keyword_index');
const path = require('path');
const fs = require('fs');
const encDec = require('../encryption-decryption');



exports.getFrontPage = (req, res, next) => {
  res.render("users", {
    pageTitle: "User",
    path: "/user",
    editing: false,
  });
};



// About Upload file ..............................................................

exports.getUploadFile = (req, res, next) =>{
  res.render("updown/upload", {
    pageTitle: "Upload a file",
    path: "/user/upload"
  });
}

exports.postUploadFile = (req, res, next) =>{
  const name = req.body.name;
  const keyword = req.body.keyword;
  const file = req.file;

  console.log(file.path);

  let tempPath = file.path.split('/')[2]; //.split('-*-')[1];

  let space_separated_keywords = keyword.split(' ');


  console.log("keywords in userController postUploadFile() = ", space_separated_keywords);

  space_separated_keywords.forEach(tmpKey =>{
    /*console.log("keykey", tmpKey, typeof(tmpKey));
    console.log(typeof(KeywordIndex));
    console.log(typeof(KeywordIndex.addThisKeywordIndex));*/

    const keyHash = encDec.getKeywordHash(tmpKey);

    /*
    const temp = this.index_hash.filter(keyHash => {
      return this.index_hash == keyHash;
    });
    */

    KeywordIndex.findOne({index_hash: keyHash}).then(keyDoc => {
      if(keyDoc){
        // If the index is already there.
        console.log("I am inside keyDoc true in postUpload of userController.");
        let newMyFiles = [...keyDoc.whereItIs.myFiles];
        newMyFiles.push({
          filePath: tempPath
        });

        const updatedList = {
          myFiles: newMyFiles
        };
        keyDoc.whereItIs = updatedList;
        keyDoc.save();
      }
      else{
        let newKey = new KeywordIndex({
          index_hash: keyHash,
          whereItIs: {
            myFiles: [ {filePath: tempPath} ]
          }
        });
        newKey.save();
      }
    });
  });



  return req.user.addToCart(tempPath, keyword)
    .then(result =>{
      res.redirect('/user/uploaded');
    });
};

// About Download file ..................................................................

exports.getDownloadFile = (req, res, next) =>{
  res.render("updown/download", {
    pageTitle: "Download a file",
    path: "/user/download"
  });
}

exports.postDownloadFile = (req, res, next) =>{
  res.send("Into post Download File route.");
}








// Rendering Uploaded and downloaded files...................................................

exports.getUploadedFiles = (req, res, next) =>{
  User.findOne({_id: req.user._id})
  .then(user =>{
    const files = user.cart.myFiles;
    res.render("updown/uploaded",{
      pageTitle: "Uploaded Files",
      path: "/user/uploaded",
      files: files
    })
  })
}
exports.getDownloadedFiles = (req, res, next) =>{
  res.render("updown/downloaded", {
    pageTitle: "Downloaded Files",
    path: "/user/downloaded"
  });
}




// Showing and Delete part........................................................

exports.showFileById = (req, res, next) =>{
  const filePath = req.params.filePath;
  let content;

  fs.readFile(path.dirname(process.mainModule.filename) + '/public/files/'+filePath, 'utf8' , (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(data);

    res.render("updown/showFile", {
      pageTitle: "Show File",
      path: "/user/uploaded",
      fileContent: data
    });
  });
}

exports.deleteFile = (req, res, next) => {
  console.log("IN the delete route.");

  const filePath = req.params.filePath;

  return req.user.deleteFromCart(filePath)
  .then(result =>{
    res.redirect('/user/uploaded');
  });
}