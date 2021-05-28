var express = require('express');
const userController = require('../controllers/user');
const isAuth = require('../middleware/is-auth');
var router = express.Router();

/* GET users listing. */
router.get('/', userController.getFrontPage);

router.get('/upload', userController.getUploadFile);
router.post('/upload', userController.postUploadFile);

router.get('/download', userController.getDownloadFile);
router.post('/download', userController.postDownloadFile);


router.get('/uploaded', isAuth, userController.getUploadedFiles);
router.get('/downloaded', userController.getDownloadedFiles);

router.get('/notification', userController.getAllNotifications);

router.get('/show-file/:myFileId', userController.showFileById);

router.get('/show-decrypted-content/:request.fileContent', userController.showDecryptedFileContent);

router.get('/request', userController.getAllRequests);

router.post('/delete-file/:myFileId', userController.deleteFile);

router.post('/request-file/:ownerId/:fileName', userController.requestFile);

router.post('/grant-permission/:requesterId/:requestedFileId', userController.grantPermission);
router.post('/deny-permission/:requesterId', userController.denyPermission);

module.exports = router;