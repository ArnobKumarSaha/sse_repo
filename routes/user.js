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


router.get('/show-file/:filePath', userController.showFileById);

router.post('/delete-file/:filePath', userController.deleteFile);

module.exports = router;