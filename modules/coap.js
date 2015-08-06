var Database = require('../persistence/mongo');
var db = new Database();
var isJson = require('../utils/common').isJson;
var model = require('../models');

module.exports = function (app) {
  return function (req, res) {
    console.log(req.method);
    var handlerGet = function () {
      res.code = '2.05';
      res.end(JSON.stringify({method: 'get'}));
    };

    var handPost = function () {
      if(!req.options) {
        other();
      }
      var existBlock = false;
      for (var i = 1; i < req.options.length; i++) {
        if (req.options[i].name === 'Block2') {
          existBlock = true;
        }
      }
      if(!existBlock) {
        other();
      }
      var username = req.options[1].value.toString();
      var password = req.options[2].value.toString();

      model.User.findOne({where: {name: username}}).then(function (user) {
        if(!user){
          return other();
        }
        user.comparePassword(password, function(err, result){
          console.log(result);
          if(result) {
            var payload = {'name': user.name, 'token': user.uid,'data': req.payload.toString()};
            db.insert(payload);
            res.code = '2.06';
            res.end(JSON.stringify({method: 'post/put'}));
          } else {
            return other();
          }
        });
      });

    };

    var other = function () {
      res.code = '4.04';
      res.end(JSON.stringify({method: "not support"}));
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
