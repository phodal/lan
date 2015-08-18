var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mqtt = require("mqtt");
var coap = require("coap");
var WebSocketServer = require('ws').Server;
var session = require('express-session');

var routes = require('./server/index');
var loader = require('./loader');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var config = require('config');
var _ = require('underscore');

var app = exports.app = express();
var configure, start;

var model = require('./models/');

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
            done(null, false, {message: "Password || Username error"})
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
  app.use(require('morgan')('combined'));
  app.use(require('cookie-parser')());
  app.use(require('body-parser').urlencoded({ extended: true }));
  app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
  }));

  app.use(passport.initialize());
  app.use(passport.session());


  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(cookieParser());

  app.use(express.static(path.join(__dirname + '/server', 'public')));

  app.use('/', routes);
  app.config = config;

  var modules = app.config.get('modules');
  for (var i = 0; i < modules.length; i++) {
    app = loader.load(app, modules[i]);
  }
  return app;
};

start = function (opts, callback) {
  configure();
  app.listen(8899, function () {
    console.log("http server run on http://localhost:8899");
  });


  if (_.include(app.config.get('modules'), 'websocket')) {
    var server = new WebSocketServer({port: 8898});
    app.websocket(server);
  }

  if (_.include(app.config.get('modules'), 'coap')) {
    coap.createServer(app.coap).listen(5683, function () {
      console.log("coap server listening on port %d", 5683);
    });
  }

  if (_.include(app.config.get('modules'), 'mqtt')) {
    mqtt.createServer(app.mqtt).listen(1883, function () {
      console.log("mqtt server listening on port %d", 1883);
    });
  }
  return app;
};

if (require.main.filename === __filename) {
  start();
}

module.exports.app = app;
module.exports.configure = configure;
module.exports.start = start;
