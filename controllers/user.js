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
  
  res.send("Into post Upload File route.");
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
  res.render("updown/uploaded", {
    pageTitle: "Uploaded Files",
    path: "/user/uploaded"
  });
}
exports.getDownloadedFiles = (req, res, next) =>{
  res.render("updown/downloaded", {
    pageTitle: "Downloaded Files",
    path: "/user/downloaded"
  });
}
