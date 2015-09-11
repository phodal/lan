var Database = require('../persistence/mongo');
var db = new Database();
var isJson = require('../utils/common').isJson;
var authCheck = require('../auth/basic');

module.exports = function (app) {
  'use strict';
  return function (req, res) {
    var deviceRex = /^\/device\/(.*)\?/;

    var other = function () {
      res.code = '4.00';
      res.end(JSON.stringify({method: 'not support'}));
    };

    if (!req.options) {
      return other();
    }
    var existBlock = false;
    var uriPathAuth = '';
    for (var i = 1; i < req.options.length; i++) {
      if (req.options[i].name === 'Uri-Query') {
        uriPathAuth = req.options[i].value.toString();
        existBlock = true;
      }
    }
    if (!existBlock) {
      return other();
    }
    var username = uriPathAuth.split(':')[0];
    var password = uriPathAuth.split(':')[1];
    var userInfo = {
      password: password,
      name: username
    };

    var errorCB = function () {
      res.code = '4.03';
      res.end({});
    };

    var handlerGet = function () {
      var successCB = function (user) {
        var payload = {name: userInfo.name, token: user.uid};
        if((deviceRex.test(req.url))) {
          payload.device = deviceRex.exec(req.url)[1];
        }
        db.query(payload, function (dbResult) {
          res.code = '2.05';
          res.end(JSON.stringify({result: dbResult}));
        });
      };
      authCheck(userInfo, errorCB, successCB, errorCB);
    };

    var handPut = function () {
      if(!(deviceRex.test(req.url))){
        res.code = '4.03';
        res.end(JSON.stringify({"topic": "no exist"}));
      }
      var successCB = function (user) {
        var payload = {name: user.name, token: user.uid, data: req.payload.toString()};
        payload.device = deviceRex.exec(req.url)[1];

        db.update(payload);
        res.code = '2.00';
        res.end(JSON.stringify({method: 'PUT'}));
      };

      authCheck(userInfo, errorCB, successCB, errorCB);
    };

    var handPost = function () {
      var successCB = function (user) {
        var payload = {name: user.name, token: user.uid, data: req.payload.toString()};
        if((deviceRex.test(req.url))) {
          payload.device = deviceRex.exec(req.url)[1];
        }

        db.insert(payload);
        res.code = '2.01';
        res.end(JSON.stringify({method: 'POST'}));
      };

      authCheck(userInfo, errorCB, successCB, errorCB);
    };

    switch (req.method) {
      case 'GET':
        handlerGet();
        break;
      case 'PUT':
        handPut();
        break;
      case 'POST':
        handPost();
        break;
      default:
        return other();
    }
  };
}
;
