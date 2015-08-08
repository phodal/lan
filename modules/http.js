var Database = require('../persistence/mongo');
var db = new Database();
var isJson = require('../utils/common').isJson;
var model = require('../models');

function getAuthInfo(req) {
  var encoded = req.headers.authorization.split(' ')[1];
  var decoded = new Buffer(encoded, 'base64').toString('utf8');

  var username = decoded.split(':')[0];
  var password = decoded.split(':')[1];
  return {username: username, password: password};
}
module.exports = function (app) {
  app.get(/^\/topics\/(.+)$/, function (req, res) {
    if (!req.headers.authorization) {
      res.statusCode = 401;
      res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
      return res.end('Unauthorized');
    }

    var userInfo = getAuthInfo(req);
    model.User.findOne({where: {name: userInfo.username}}).then(function (user) {
      if (!user) {
        return res.sendStatus(404);
      }
      user.comparePassword(userInfo.password, function (err, result) {
        if (result) {
          var topic = req.params[0];
          return res.json({'username': userInfo.username, 'topic': topic});
        } else {
          return res.sendStatus(404);
        }
      });
    });
  });

  function update(req, res) {
    if (!req.headers.authorization) {
      return res.sendStatus(403);
    }
    var userInfo = getAuthInfo(req);

    model.User.findOne({where: {name: userInfo.username}}).then(function (user) {
      if (!user) {
        return res.sendStatus(404);
      }
      user.comparePassword(userInfo.password, function (err, result) {
        if (result) {
          var payload = {'name': user.name, 'token': user.uid, 'data': req.body};
          db.insert(payload);
          return res.sendStatus(204);
        } else {
          return res.sendStatus(404);
        }
      });
    });
  }

  app.post(/^\/topics\/(.+)$/, function (req, res) {
    return update(req, res);
  });

  return app.put(/^\/topics\/(.+)$/, function (req, res) {
    update(req, res);
  });
};
