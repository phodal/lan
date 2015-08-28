var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var routes = require('./server/index');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var config = require('config');

var app = exports.app = express();
var configure, start;

var model = require('./models/');

var loader = function (app, key) {
  var loadPath;
  loadPath = __dirname + ("/modules/");
  app[key] = require(loadPath + key)(app);
  return app;
};

passport.use(new LocalStrategy(
  {
    usernameField: 'name',
    passwordField: 'password'
  },
  function (username, password, done) {
    model.User.find({where: {name: username}}).then(function (user) {
      if (!user) {
        done(null, false, {message: 'Unknown user'});
      } else {
        user.comparePassword(password, function (err, result) {
          if (result) {
            done(null ,true);
          } else {
            done(null, false, {message: 'Password || Username error'})
          }
        });
      }
    }).error(function (err) {
      done(err);
    });
  }
));

passport.serializeUser(function (user, done) {
  done(null, user.uid);
});

passport.deserializeUser(function (uid, done) {
  model.User.find({where: {uid: uid}})
    .then(function (user) {
    done(null, user);
  }).error(function (err) {
    console.log(id, err);
    done(err, null);
  });
});

configure = function () {
  app.set('views', path.join(__dirname + '/server', 'views'));
  app.set('view engine', 'jade');
  app.use(require('cookie-parser')());
  app.use(require('body-parser').urlencoded({ extended: true }));
  app.use(session({
    secret: config.get('secret'),
    resave: true,
    saveUninitialized: true
  }));

  app.use(passport.initialize());
  app.use(passport.session());


  if(config.get('logging')){
    app.use(logger('dev'));
  }

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname + '/server', 'public')));
  app.use('/', routes);

  var modules = config.get('modules');
  for (var i = 0; i < modules.length; i++) {
    app = loader(app, modules[i]);
  }
  return app;
};

module.exports.app = app;
module.exports.configure = configure;
