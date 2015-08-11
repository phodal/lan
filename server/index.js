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
  models.User.create({
    name: req.body.name,
    password: req.body.password,
    phone: req.body.phone,
    alias: req.body.alias
  }).then(function (user, err) {
    if (err) {
      return res.redirect('/');
    }

    console.log(user.uid);
    passport.authenticate('local')(req, res, function () {
      res.render('success', {
        title: 'Create Success',
        account: user
      });
    });
  });
});

router.get('/register', function (req, res) {
  'use strict';
  res.render('register', {title: 'Welcome Lan Account Manager'});
});

module.exports = router;
