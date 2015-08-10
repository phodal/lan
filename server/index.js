var express = require('express');
var router = express.Router();
var passport = require('passport');
var models = require('../models/');

/* GET home page. */
router.get('/', function (req, res) {
  'use strict';
  res.render('index', {title: 'Lan'});
});

router.post('/register', function (req, res) {
  console.log(req.body);
  models.User.create({
    name: req.body.name,
    password: req.body.password,
    uuid: '84e824cb-bfae-4d95-a76d-51103c556057',
    phone: req.body.phone,
    alias: req.body.alias
  }).then(function (user, err) {

    console.log(err);
    if (err) {
      return res.render('register', {account: user});
    }

    console.log(user)

    passport.authenticate('local')(req, res, function () {
      res.redirect('/');
    });
  });
});

router.get('/register', function(req, res) {
  res.render('register', { });
});

module.exports = router;
