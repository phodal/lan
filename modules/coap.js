var Database = require('../persistence/mongo');
var db = new Database();
var isJson = require('../utils/common').isJson;
var model = require('../models');

module.exports = function (app) {
  return function (req, res) {
    var other = function () {
      res.code = '4.04';
      res.end(JSON.stringify({method: "not support"}));
    };

    if (!req.options) {
      other();
    }
    var existBlock = false;
    for (var i = 1; i < req.options.length; i++) {
      if (req.options[i].name === 'Block2') {
        existBlock = true;
      }
    }
    if (!existBlock) {
      other();
    }
    var username = req.options[1].value.toString();
    var password = req.options[2].value.toString();
    console.log("info", username, password);

    var handlerGet = function () {
      model.User.findOne({where: {name: username}}).then(function (user) {
        if (!user) {
          return other();
        }
        user.comparePassword(password, function (err, result) {
          if (result) {
            console.log(username, user.uid);
            var options = {name: username, token: user.uid};

            db.query(options, function (dbResult) {
              console.log(dbResult);
              res.code = '2.06';
              res.end({result: dbResult});
              return;
            });
          } else {
            res.code = '4.04';
            res.end({});
            return;
          }
        });
      });
    };

    var handPost = function () {
      model.User.findOne({where: {name: username}}).then(function (user) {
        if (!user) {
          return other();
        }
        user.comparePassword(password, function (err, result) {
          console.log(result);
          if (result) {
            var payload = {'name': user.name, 'token': user.uid, 'data': req.payload.toString()};
            db.insert(payload);
            res.code = '2.06';
            res.end(JSON.stringify({method: 'post/put'}));
          } else {
            return other();
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
