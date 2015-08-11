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
  models.User.create({
    name: req.body.name,
    password: req.body.password,
    uuid: '84e824cb-bfae-4d95-a76d-51103c556057',
    phone: req.body.phone,
    alias: req.body.alias
  }).then(function (user, err) {
    if (err) {
      return res.redirect('/');
    }
    models.User.findOne({where: {name: req.body.name}})
      .then(function (currentUser) {
        console.log(currentUser);
        passport.authenticate('local')(req, res, function () {
          res.redirect('304', '/register');
        });
      });
  });
});

router.get('/register', function (req, res) {
  res.render('register', {title: 'Welcome Lan Account Manager'});
});

module.exports = router;
