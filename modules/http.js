var Database = require('../persistence/mongo');
var db = new Database();
var isJson = require('../utils/common').isJson;
var model = require('../models');
var authCheck = require('../auth/basic');

function getAuthInfo(req) {
  var encoded = req.headers.authorization.split(' ')[1];
  var decoded = new Buffer(encoded, 'base64').toString('utf8');

  var username = decoded.split(':')[0];
  var password = decoded.split(':')[1];
  return {name: username, password: password};
}

module.exports = function (app) {
  app.get(/^\/topics\/(.+)$/, function (req, res) {
    if (!req.headers.authorization) {
      res.statusCode = 401;
      res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
      return res.end('Unauthorized');
    }

    var userInfo = getAuthInfo(req);

    var noUserCB = function () {
      res.sendStatus(403);
    };

    var errorCB = function () {
      res.sendStatus(403);
    };

    var successCB = function (user) {
      var options = {name: userInfo.userName, token: user.uid};
      db.query(options, function (dbResult) {
        return res.json({'username': userInfo.username, 'topic': dbResult});
      });
    };

    authCheck(userInfo, noUserCB, successCB, errorCB);
  });

  function update(req, res) {
    if (!req.headers.authorization) {
      return res.sendStatus(403);
    }
    var userInfo = getAuthInfo(req);

    var noUserCB = function () {
      res.sendStatus(403);
    };

    var errorCB = function () {
      res.sendStatus(403);
    };

    var successCB = function (user) {
      var payload = {'name': user.name, 'token': user.uid, 'data': req.body};
      db.insert(payload);
      res.sendStatus(204);
    };

    authCheck(userInfo, noUserCB, successCB, errorCB);
  }

  app.post(/^\/topics\/(.+)$/, function (req, res) {
    return update(req, res);
  });

  return app.put(/^\/topics\/(.+)$/, function (req, res) {
    update(req, res);
  });
};
