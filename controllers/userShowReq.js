const User = require('../models/user');
const KeywordIndex = require('../models/keyword_index');
const File = require('../models/file');

const path = require('path');
const fs = require('fs');
const encDec = require('../EncryptDecrypt-v2');

const { ObjectID } = require('bson');

exports.showFileById = (req, res, next) =>{
  const fileId = req.params.myFileId;

  console.log("showFileById : fileId = ", fileId);

  File.findById(ObjectID(fileId)).then((theFile) => {
    const filePath = theFile.filePath;
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
  })
}

exports.requestFile = async (req, res, next) =>{
    const ownerId = req.params.ownerId;
    const fileName = req.params.fileName;
  
    console.log("requesting file begins");
    console.log(ownerId, fileName);
  
    if(req.user._id == ownerId){
      return res.render('updown/searchResult', {
        pageTitle: "Search result",
        path: "/user/searchResult",
        docs: documents,
        errorMessage: "This is your file man! "
      });
    }
  
    const theFile = await File.findOne({filePath: fileName});
  
    const owner = await User.findOne({_id: ownerId});
  
    const updatedNotificationItems = [...owner.reqs.notifications];
  
    console.log("theFile = ", theFile, "owner = ", owner, "updatedNoti = ", updatedNotificationItems);
  
    updatedNotificationItems.push({
      requesterId: req.user._id,
      requestedFileId: theFile._id,
      decided: false
    });
    const updatedReqs = {
      notifications: updatedNotificationItems
    };
    console.log("updated noti = ", updatedNotificationItems, "updated reqs = ", updatedReqs);
    owner.reqs = updatedReqs;
    await owner.save();
  
    console.log('Done with reques file.');
    res.render('updown/searchResult', {
      pageTitle: "Search result",
      path: "/user/searchResult",
      docs: documents,
      errorMessage: "Requset has been sent to the DataOwner. "
    });
  }
  
  
exports.grantPermission = async (req, res, next) =>{
  const requesterId = req.params.requesterId;
  const requestedFileId = req.params.requestedFileId;

  const theFile = await File.findOne({_id: requestedFileId});
  const requester = await User.findOne({_id: requesterId});

  console.log("theFile = ", theFile, "owner = ", requester);


  const plainDataFilePath = await encDec.getDecryptFile(theFile.filePath); //return output dont write
  await encDec.getEncryptFileV2(requester.publicKey, plainDataFilePath); 


  let filePath = plainDataFilePath.split('/')[2];
  //console.log(filePath);

  const updatedRequestedItems = [...requester.dcart.allRequests];

  updatedRequestedItems.push({
    isAccept: true,
    ownerId: req.user._id,
    requestedFileId: theFile._id,
    fileContent: filePath
  });
  //console.log(updatedRequestedItems);
  const updatedAllReqs = {
    allRequests: updatedRequestedItems
  };
  //console.log(updatedAllReqs);
  requester.dcart = updatedAllReqs;
  await requester.save();

  //need to change
  console.log('Done with Grant Permission.');
  res.redirect('/user/notification');
}

exports.denyPermission = async (req, res, next) =>{
  const requesterId = req.params.requesterId;

  const requester = await User.findOne({_id: requesterId});

  const updatedRequestedItems = [...requester.dcart.allRequests];

  //console.log(updatedRequestedItems);
  updatedRequestedItems.push({
    isAccept: false,
    ownerId: req.user._id
    //requestedFileId: ,
    //fileContent: 
  });
  const updatedAllReqs = {
    allRequests: updatedRequestedItems
  };

  requester.dcart = updatedAllReqs;
  await requester.save();

  //need to change
  console.log('Done with Grant Permission.');
  res.redirect('/user/notification');
}

exports.getAllNotifications = (req, res, next) =>{
  User.findOne({_id: req.user._id})
  .then(user =>{
    const notifications = user.reqs.notifications;
    res.render("updown/notification",{
      pageTitle: "Notifications",
      path: "/user/notification",
      notifications: notifications
    })
  })
}

exports.getAllRequests = (req, res, next) =>{
  User.findOne({_id: req.user._id})
  .then(user =>{
    const requests = user.dcart.allRequests;
    res.render("updown/request",{
      pageTitle: "All Requests",
      path: "/user/request",
      requests: requests
    })
  })
}

exports.showDecryptedFileContent = (req, res, next) =>{
  const content = req.params.fileContent;
  res.redirect('/user/notification');
}