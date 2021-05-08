var express = require('express');
const userController = require('../controllers/user');
var router = express.Router();

/* GET users listing. */
router.get('/', userController.getFrontPage);

router.get('/upload', userController.getUploadFile);
router.post('/upload', userController.postUploadFile);

router.get('/download', userController.getDownloadFile);
router.post('/download', userController.postDownloadFile);


router.get('/uploaded', userController.getUploadedFiles);
router.get('/downloaded', userController.getDownloadedFiles);

module.exports = router;