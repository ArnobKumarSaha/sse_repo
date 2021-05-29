const User = require('../models/user');
const KeywordIndex = require('../models/keyword_index');
const File = require('../models/file');

const path = require('path');
const fs = require('fs');
const encDec = require('../EncryptDecrypt-v2');

const { ObjectID } = require('bson');
const documents = require('../controllers/userUpDownDel').getDocuments();

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
    const fileName = req.params.fileName; // the file path actually (without /public/files.)
    console.log("requesting file begins");



    //If it is his file.
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


  
    // Update the Owner's notification array.
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
    // Show the search results to the User.
    res.render('updown/searchResult', {
      pageTitle: "Search result",
      path: "/user/searchResult",
      docs: documents,
      errorMessage: "Requset has been sent to the DataOwner. "
    });
  }

function fudai(p){
  return new Promise((resolve, reject) => {
    fs.readFile(p, (err, data)=> { //can not be utf8
      console.log('Inside fudai.. data:'+ data.toString());
      resolve(data);
    });
  });
}  
  
exports.grantPermission = async (req, res, next) =>{
  const requesterId = req.params.requesterId;
  const requestedFileId = req.params.requestedFileId;
  const theFile = await File.findOne({_id: requestedFileId});
  const requester = await User.findOne({_id: requesterId});
  console.log("theFile = ", theFile, "requester = ", requester, "requester public key = ", requester.publicKey);


  
  
  //const plainDataFilePath = await encDec.getDecryptFile(theFile.filePath); 
  //await encDec.getEncryptFileV2(requester.publicKey.toString(), plainDataFilePath); 
  const plainDataFilePath = await encDec.getDecryptFile(theFile.filePath);
  const fpath = await encDec.getEncryptFileV2(requester.publicKey, plainDataFilePath);

  
  //let encryptedContent = await fudai(fpath);
  

  const updatedRequestedItems = [...requester.dcart.allRequests];

  updatedRequestedItems.push({
    isAccept: true,
    ownerId: req.user._id,
    requestedFileId: theFile._id,
    fileContent: await fudai(fpath) //encryptedContent
  });
  const updatedAllReqs = {
    allRequests: updatedRequestedItems
  };
  //console.log(updatedAllReqs);
  requester.dcart = updatedAllReqs;
  await requester.save();



  console.log(requester);

  //need to change

  /*
  let currentUser = await User.findOne({_id: req.user._id});
  const updatedNotificationItems = [...currentUser.reqs.notifications];
  let itemToBeSaved;
  for(let item of updatedNotificationItems){
    console.log('item -> ', item);
    if(item.requesterId.equals(requesterId) && item.requestedFileId.equals(requestedFileId)){
      item.decided = true;
      itemToBeSaved = item;
      break;
    }
  }
  */

  const query = {
    'reqs.notifications': {
      $elemMatch: {
        requesterId: requesterId,
        requestedFileId: requestedFileId
      }
    }
  };

  /*const fuckUser = await User.findOne(query);
  console.log('\n',fuckUser,'\n');*/

  await User.updateOne(query, {$set: {
    'reqs.notifications.$.decided': true
  }} );

  console.log('Done with Grant Permission.');
  res.redirect('/user/notification');
}

exports.denyPermission = async (req, res, next) =>{
  const requesterId = req.params.requesterId;
  const requestedFileId = req.params.requestedFileId;

  const requester = await User.findOne({_id: requesterId});

  const updatedRequestedItems = [...requester.dcart.allRequests];

  //console.log(updatedRequestedItems);
  updatedRequestedItems.push({
    isAccept: false,
    ownerId: req.user._id
  });
  const updatedAllReqs = {
    allRequests: updatedRequestedItems
  };

  requester.dcart = updatedAllReqs;
  await requester.save();

  console.log('\n', requester, '\n');

  //need to change
  const query = {
    'reqs.notifications': {
      $elemMatch: {
        requesterId: requesterId,
        requestedFileId: requestedFileId
      }
    }
  };
  await User.updateOne(query, {$set: {
    'reqs.notifications.$.decided': true
  }} );

  console.log('Done with Deny Permission.');
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
  //console.log(fs.readFileSync('./public/files/rosalind.txt').toString());
  console.log(content);

  const plainData = encDec.getDecryptFileContent(content);

  res.render("updown/showDecryptedContent",{
    pageTitle: "File Content",
    path: "/user/request",
    documents: plainData
  })
}