const User = require('../models/user');
const path = require('path');
const fs = require('fs');



exports.getFrontPage = (req, res, next) => {
  res.render("users", {
    pageTitle: "User",
    path: "/user",
    editing: false,
  });
};

exports.getUploadFile = (req, res, next) =>{
  res.render("updown/upload", {
    pageTitle: "Upload a file",
    path: "/user/upload"
  });
}

exports.postUploadFile = (req, res, next) =>{
  const name = req.body.fileName;
  const file = req.file;

  console.log(file.path);
  // You can get the uploaded files in /files folder.
  //This is working nicely . Just need to add the path link to database.

  let tempPath = file.path.split('/')[1]; //.split('-*-')[1];

  return req.user.addToCart(tempPath)
    .then(result =>{
      res.redirect('/user/uploaded');
    });
}

exports.getDownloadFile = (req, res, next) =>{
  res.render("updown/download", {
    pageTitle: "Download a file",
    path: "/user/download"
  });
}

exports.postDownloadFile = (req, res, next) =>{
  res.send("Into post Download File route.");
}








// Rendering Uploaded and downloaded files.

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


exports.showFileById = (req, res, next) =>{
  const filePath = req.params.filePath;
  let content;

  fs.readFile(path.dirname(process.mainModule.filename) + '/files/'+filePath, 'utf8' , (err, data) => {
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