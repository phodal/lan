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

router.get('/login', function (req, res) {
  'use strict';
  if(!req.isAuthenticated()){
    res.render('login/index', {title: 'Lan Login'});
  } else {
    res.render('login/success', {
      title: 'Already login ' + req.user.name,
      uid: req.user.uid,
      userName: req.user.name,
      phone: req.user.phone,
      alias: req.user.alias
    });
  }
});


router.post('/login', function (req, res) {
  'use strict';

  var userInfo = {
    name: req.body.name,
    password: req.body.password
  };

  models.User.findOne({where: {name: userInfo.name}}).then(function (user) {
    if (!user) {
      req.session.messages = 'not such user';
      return res.redirect('/login');
    }
    user.comparePassword(userInfo.password, function (err, result) {
        if (result) {

          passport.authenticate('local')(req, res, function () {
            req.logIn(user, function (err) {
              console.log('----------------');
              console.log(err);

              req.session.messages = 'Login successfully';
              return res.render('login/success', {
                title: 'Welcome ' + user.name,
                uid: user.uid,
                userName: user.name,
                phone: user.phone,
                alias: user.alias
              });
            });
          });
        } else {
          return res.sendStatus(404);
        }
      }
    );
  });
});

router.get('/logout', function (req, res) {
  'use strict';
  if (req.isAuthenticated()) {
    req.logout();
    //req.session.messages = req.i18n.__("Log out successfully");
    req.session.messages = 'Log out successfully';
  }
  res.redirect('/');
});

router.get(/^\/users\/(.+)$/, function (req, res) {
  'use strict';
  if(!req.isAuthenticated()){
    res.redirect('/login');
  }
  models.User.findOne({where: {name: req.params[0]}}).then(function (user) {
    if (!user) {
      return res.sendStatus(403);
    }

    return res.render('user/index', {
      title: user.name + '\'s Profile',
      user: user
    });
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
        return res.render('user/register', {user: userInfo, title: 'Something Error', errors: err.errors});
      }
      models.User.create(userInfo).then(function (user, err) {
        if (err) {
          return res.redirect('/');
        }

        console.log(user.uid);
        passport.authenticate('local')(req, res, function () {
          res.render('success', {
            title: 'Create Success,' + user.name,
            account: user,
            uid: user.uid
          });
        });
      });
    });
});

router.get('/register', function (req, res) {
  'use strict';
  res.render('user/register', {title: 'Lan Account Manager', errors: ''});
});

module.exports = router;
