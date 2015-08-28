var Database = require('../persistence/mongo');
var db = new Database();
var isJson = require('../utils/common').isJson;
var authCheck = require('../auth/basic');

module.exports = function (app) {
  return function (req, res) {
    var other = function () {
      res.code = '4.00';
      res.end(JSON.stringify({method: "not support"}));
    };

    if (!req.options) {
      return other();
    }
    var existBlock = false;
    var uriPathAuth = "";
    for (var i = 1; i < req.options.length; i++) {
      if (req.options[i].name === 'Uri-Query') {
        uriPathAuth = req.options[i].value.toString();
        existBlock = true;
      }
    }
    if (!existBlock) {
      return other();
    }
    var username = uriPathAuth.split(":")[0];
    var password = uriPathAuth.split(":")[1];
    var userInfo = {
      password: password,
      name: username
    };

    var noUserCB = function () {
      res.code = '4.03';
      res.end(JSON.stringify({method: "not auth"}));
    };

    var errorCB = function () {
      res.code = '4.03';
      res.end({});
    };

    var handlerGet = function () {
      var successCB = function (user) {
        var options = {name: userInfo.name, token: user.uid};
        db.query(options, function (dbResult) {
          res.code = '2.05';
          res.end(JSON.stringify({result: dbResult}));
        });
      };
      authCheck(userInfo, noUserCB, successCB, errorCB);
    };

    var handPost = function () {
      var successCB = function (user) {
        var payload = {'name': user.name, 'token': user.uid, 'data': req.payload.toString()};
        db.insert(payload);
        res.code = '2.01';
        res.end(JSON.stringify({method: 'post/put'}));
      };

      authCheck(userInfo, noUserCB, successCB, errorCB);
    };

    switch (req.method) {
      case "GET":
        handlerGet();
        break;
      case "PUT":
      case "POST":
        handPost();
        break;
      default:
        return other();
        break;
    }
  };
}
;
