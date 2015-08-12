var express = require('express');
var router = express.Router();
var passport = require('passport');
var models = require('../models/');

router.get('/', function (req, res) {
  'use strict';
  res.render('index', {
    title: 'Welcome to Lan'
  });
});

router.post('/register', function (req, res) {
  'use strict';
  var userInfo = {
    name: req.body.name,
    password: req.body.password,
    phone: req.body.phone,
    alias: req.body.alias
  };

  models.User.build(userInfo)
    .validate()
    .then(function (err) {
      console.log(err);
      if (err) {
        console.log(err.errors);
        return res.render('register', {user: userInfo, title: 'Something Error', errors: err.errors})
      }
      models.User.create(userInfo).then(function (user, err) {
        if (err) {
          return res.redirect('/');
        }

        console.log(user.uid);
        passport.authenticate('local')(req, res, function () {
          res.render('success', {
            title: 'Create Success',
            account: user,
            uid: user.uid
          });
        });
      });
    })
});

router.get('/register', function (req, res) {
  'use strict';
  res.render('register', {title: 'Welcome Lan Account Manager', errors: ''});
});

module.exports = router;
