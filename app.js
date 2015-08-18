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

var app = express();
var configure, start;

configure = function () {
  app.set('views', path.join(__dirname + '/server', 'views'));
  app.set('view engine', 'jade');

  app.set('trust proxy', 1);
  app.use(session({
    secret: 'keyboard cat', //Change this in Production
    //resave: false,
    //saveUninitialized: true,
    cookie: {secure: true}
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  var models = require('./models/');
  passport.serializeUser(function (user, done) {
    console.log("--------------");
    console.log(user.uid);
    done(null, user.uid);
  });

  passport.deserializeUser(function (uid, done) {
    models.User.find({where: {uid: uid}}).success(function (user) {
      done(null, user);
    }).error(function (err) {
      console.log(id, err);
      done(err, null);
    });
  });

  passport.use(new LocalStrategy(
    {
      usernameField: 'name',
      passwordField: 'password'
    },
    function (username, password, done) {
      models.User.find({where: {name: username}}).success(function (user) {
        console.log(user.name);
        if (!user) {
          done(null, false, {message: 'Unknown user'});
        } else if (password != user.password) {
          done(null, false, {message: 'Invalid password'});
        } else {
          done(null, user);
        }
      }).error(function (err) {
        done(err);
      });
    }
  ));

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
