var Database = require('../persistence/mongo');
var db = new Database();
var isJson = require('../utils/common').isJson;
var model = require('../models');

module.exports = function (app) {
  return function (req, res) {
    var other = function () {
      res.code = '4.04';
      return res.end(JSON.stringify({method: "not support"}));
    };

    if (!req.options) {
      other();
      return;
    }
    var existBlock = false;
    for (var i = 1; i < req.options.length; i++) {
      if (req.options[i].name === 'Block2') {
        existBlock = true;
      }
    }
    if (!existBlock) {
      other();
      return;
    }
    var username = req.options[1].value.toString();
    var password = req.options[2].value.toString();

    var handlerGet = function () {
      model.User.findOne({where: {name: username}}).then(function (user) {
        if (!user) {
          res.code = '4.03';
          return res.end({method: "not auth"});
        }
        user.comparePassword(password, function (err, result) {
          if (result) {
            console.log(username, user.uid);
            var options = {name: username, token: user.uid};

            db.query(options, function (dbResult) {
              res.code = '2.06';
              return res.end({result: dbResult});
            });
          } else {
            res.code = '4.03';
            return res.end({});
          }
        });
      });
    };

    var handPost = function () {
      model.User.findOne({where: {name: username}}).then(function (user) {
        if (!user) {
          res.code = '4.03';
          return res.end(JSON.stringify({error: "not auth"}));
        }
        user.comparePassword(password, function (err, result) {
          console.log(result);
          if (result) {
            var payload = {'name': user.name, 'token': user.uid, 'data': req.payload.toString()};
            db.insert(payload);
            res.code = '2.06';
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
