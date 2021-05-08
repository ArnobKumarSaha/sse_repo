var express = require('express');
const indexController = require('../controllers/index');
var router = express.Router();

router.get('/', indexController.getFrontPage);

router.get('/login', indexController.getLogin);
router.post('/login', indexController.postLogin);

router.get('/signup', indexController.getSignup);
router.post('/signup', indexController.postSignup);

module.exports = router;