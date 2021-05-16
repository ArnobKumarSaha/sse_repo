const User = require('../models/user');
const KeywordIndex = require('../models/keyword_index');
const path = require('path');
const fs = require('fs');
const encDec = require('../encryption-decryption');
const user = require('../models/user');



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



  space_separated_keywords.forEach(tmpKey =>{

    const keyHash = encDec.getKeywordHash(tmpKey);

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

var freqTable = {};

// It finds out the entries from DB those are matched with searched keywords.
// Then finds out the file path, And count the frequencies.
async function calculate1(space_separated_keywords){

  freqTable = {};

  for(let tmpKey of space_separated_keywords){
    const keyHash = await encDec.getKeywordHash(tmpKey);

    const keyDoc = await KeywordIndex.findOne({index_hash: keyHash});

    //console.log("keyDoc = ", keyDoc);
    if(keyDoc){
      let myfiles = [...keyDoc.whereItIs.myFiles];

      for(var fl of myfiles){
        var fp = fl.filePath;

        if(freqTable[fp]==1) {freqTable[fp]++; console.log("IN true.");}
        else { freqTable[fp] = 1; console.log("In False. ", freqTable);}
      }
      
    }
    else{
      console.log("Inside else block!");
    }
  }
}
var sortable = [];
var documents = [];

// It makes the array sorted in descending order. To show more matched files before the less matched files.
function calculate2(){
  sortable = [];
  documents = [];
  return new Promise( (resolve, reject) =>{
    
    for (var file in freqTable) {
        sortable.push([file, freqTable[file]]);
    }
    sortable.sort(function(a, b) {
        return b[1] - a[1];
    });

    resolve(sortable);
    //console.log("Calculate function ends. (After resolve) ", freqTable, typeof(freqTable) );
  });
}

async function intermediateFunction(space_separated_keywords){
  console.log("At the start of intermediate function.");
  await calculate1(space_separated_keywords);
  await calculate2();

  for(let doc of sortable){
    const userDoc = await User.findOne({ "cart.myFiles.filePath": doc[0]},  {name: 1} );
    doc.push(userDoc._id);
    documents.push(doc);
  }
  return;
}

exports.postDownloadFile = async (req, res, next) =>{

  const keyword = req.body.keyword;

  let space_separated_keywords = keyword.split(' ');

  await intermediateFunction(space_separated_keywords);

  res.render('updown/searchResult', {
    pageTitle: "Search result",
    path: "/user/searchResult",
    docs: documents
  });
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