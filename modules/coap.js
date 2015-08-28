var Database = require('../persistence/mongo');
var db = new Database();
var isJson = require('../utils/common').isJson;
var model = require('../models');

var authCheck = function (userInfo, noUserCB, successCB, errorCB) {
  model.User.findOne({where: {name: userInfo.name}}).then(function (user) {
    if (!user) {
      return noUserCB();
    }
    user.comparePassword(userInfo.password, function (err, result) {
      if (result) {
        return successCB(user);
      } else {
        return errorCB();
      }
    });
  })
};

module.exports = function (app) {
  return function (req, res) {
    var other = function () {
      res.code = '4.00';
      return res.end(JSON.stringify({method: "not support"}));
    };

    if (!req.options) {
      other();
      return;
    }
    var existBlock = false;
    var uriPathAuth = "";
    for (var i = 1; i < req.options.length; i++) {
      if (req.options[i].name === 'Uri-Query') {
        console.log(req.options[i].value.toString());
        uriPathAuth = req.options[i].value.toString();
        existBlock = true;
      }
    }
    if (!existBlock) {
      other();
      return;
    }
    var username = uriPathAuth.split(":")[0];
    var password = uriPathAuth.split(":")[1];

    var handlerGet = function () {
      var userInfo = {
        password: password,
        name: username
      };

      var noUserCB = function () {
        res.code = '4.03';
        res.end(JSON.stringify({method: "not auth"}));
      };

      var successCB = function (user) {
        var options = {name: userInfo.name, token: user.uid};

        db.query(options, function (dbResult) {
          res.code = '2.05';
          res.end(JSON.stringify({result: dbResult}));
        });
      };

      var errorCB = function () {
        res.code = '4.03';
        res.end({});
      };

      authCheck(userInfo, noUserCB, successCB, errorCB);
    };

    var handPost = function () {
      model.User.findOne({where: {name: username}}).then(function (user) {
        if (!user) {
          res.code = '4.03';
          return res.end(JSON.stringify({error: "not auth"}));
        }
        user.comparePassword(password, function (err, result) {
          if (result) {
            var payload = {'name': user.name, 'token': user.uid, 'data': req.payload.toString()};
            db.insert(payload);
            res.code = '2.01';
            return res.end(JSON.stringify({method: 'post/put'}));
          } else {
            res.code = '4.03';
            return res.end(JSON.stringify({error: "not auth"}));
          }
        });
      });

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
        other();
        break;
    }
  };
}
;
