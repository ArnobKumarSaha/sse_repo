const bcrypt = require('bcryptjs');

const { validationResult } = require('express-validator');

const User = require('../models/user');



exports.getFrontPage = (req,res, next) => {
    res.redirect("/user");
}

exports.getLogin = (req,res, next) => {
    let message = req.flash('error');
    if (message.length > 0) { // if there is an error-flash
      message = message[0];
    } else {
      message = null;
    }
    res.render('auth/login', {
      path: '/login',
      pageTitle: 'Login Page',
      errorMessage: message,
      oldInput: {
        email: '',
        password: ''
      },
      validationErrors: []
    });
}

function loginHelper(req,res,errors){
    res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: req.body.email,
        password: req.body.password,
        typeOfUser: req.body.typeOfUser
      },
      validationErrors: errors.array()
    });
  };

exports.postLogin = (req,res, next) => {
  const email = req.body.email;
  const password = req.body.password; 

  const errors = validationResult(req);
  // if there are errors , render the same page (with user-entered info.)
  if (!errors.isEmpty()) {
    return loginHelper(req,res,errors);
  }

  User.findOne({ email: email })
    .then(user => {
      // user exists with this email , bcz we checked it already in auth route.
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) { // password validation
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          // Incorrect password entered.

          return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login Page',
            errorMessage: 'Invalid email or password',
            oldInput: {
              email: req.body.email,
              password: req.body.password
            },
            validationErrors: errors.array()
          });
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch(err => console.log(err));
}

exports.getSignup = (req,res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    res.render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: message,
      oldInput: { // for better user experience... So that user don't have to enter all the fields again.
        email: '',
        password: '',
        confirmPassword: '',
        name: ''
      },
      validationErrors: []
    });
}

exports.postSignup = (req,res, next) => {
    const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const name = req.body.name;

  const errors = validationResult(req);
  // if there are errors , render the same page (with user-entered info.)
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
        name: name
      },
      validationErrors: errors.array()
    });
  }
  // If no error, encrypt the password, and save the user into database.
  bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        name: name,
        cart: {
          myFiles: []
        },
        reqs: {
          notifications: []
        }
      });
      return user.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => {
      console.log(err);
    });
}

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};