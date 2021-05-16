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


  //console.log("keywords in userController postUploadFile() = ", space_separated_keywords);

  space_separated_keywords.forEach(tmpKey =>{
    /*console.log("keykey", tmpKey, typeof(tmpKey));
    console.log(typeof(KeywordIndex));
    console.log(typeof(KeywordIndex.addThisKeywordIndex));*/

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

function calculate1(space_separated_keywords){

  return new Promise( (resolve, reject) => {

      console.log("calculate Function starts. ", space_separated_keywords);

      for(let tmpKey of space_separated_keywords){
        const keyHash = encDec.getKeywordHash(tmpKey);
        console.log(tmpKey, keyHash);

        KeywordIndex.findOne({index_hash: keyHash})
        .then(keyDoc => {
          console.log("keyDoc = ", keyDoc);
          if(keyDoc){
            let myfiles = [...keyDoc.whereItIs.myFiles];

            for(var fl of myfiles){
              var fp = fl.filePath;
              console.log("Type = ", typeof(fp));

              if(freqTable[fp]) {freqTable[fp]++; console.log("IN true.");}
              else { freqTable[fp] = 1; console.log("In False. ", freqTable);}
            }
            
          }
          else{
            console.log("Inside else block!");
          }
        });
      }
      resolve();
   });
}
var sortable = [];
function calculate2(){
        //setTimeout(()=>{
        // Now , sort them in descending order to get top 5.
      return new Promise( (resolve, reject) =>{
        
        for (var file in freqTable) {
            sortable.push([file, freqTable[file]]);
        }

        console.log("Printing sortable 1: ", sortable);

        sortable.sort(function(a, b) {
            return b[1] - a[1];
        });

        console.log("Printing sortable 2: ", sortable);

        // This is to show the Owner of the top-matched files.

        /*User.findOne({ "cart.myFiles.filePath": fp},  {name: 1} ).then(userDoc => {
          console.log(userDoc.name);
        })
          .catch(err => console.log(err));*/
        

        console.log("Calculate function ends. (Before resolve) ", freqTable, typeof(freqTable) );
        resolve(sortable);
        console.log("Calculate function ends. (After resolve) ", freqTable, typeof(freqTable) );
        //return sortable;
      });
      //}, 3000);
}

async function intermediateFunction(space_separated_keywords){
  console.log("At the start of intermediate function.");
  //const documents = await calculate1(space_separated_keywords);
  /*calculate1(space_separated_keywords).then(() =>{
    console.log("Here I am !");
    calculate2().then(documents =>{
      console.log("Before the return statement of intermediate function. ", documents);
      return documents;
    });
  })*/
  await calculate1(space_separated_keywords);
  await calculate2();
  console.log("Before return , and after calculates called, in intermediate");
  return;
}

exports.postDownloadFile = async (req, res, next) =>{

  const keyword = req.body.keyword;

  let space_separated_keywords = keyword.split(' ');


  /*intermediateFunction(space_separated_keywords)
    .then( freqTable => {
      console.log("keywords in userController postDownloadFile() = ", space_separated_keywords);
      console.log(freqTable);
    
      res.send("Into post Download File route.");
    })
    .catch(err => console.log(err) );*/

  await intermediateFunction(space_separated_keywords);
  console.log("In postDownloadFunction ", sortable);
  
  res.render('updown/searchResult', {
    pageTitle: "Search result",
    path: "/user/searchResult",
    docs: sortable
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