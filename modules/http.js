var Database = require('../persistence/mongo');
var db = new Database();
var isJson = require('../utils/common').isJson;
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var model = require('../models');

module.exports = function (app) {
	app.get(/^\/topics\/(.+)$/, function (req, res) {
		var topic = req.params[0];
		//数据库操作
		res.json({'topic': topic});
	});

	function update(req, res) {
    var encoded = req.headers.authorization.split(' ')[1];
    var decoded = new Buffer(encoded, 'base64').toString('utf8');
    console.log(decoded);

    var username = decoded.split(':')[0];
    var password = decoded.split(':')[1];

    model.User.findOne({where: {name: username}}).then(function (user) {
      if(!user){
        return res.sendStatus(404);
      }
      user.comparePassword(password, function(err, result){
        if(result) {
          //var payload = req.body;
          //if(!isJson(payload)){
          var payload = {'name': user.name, 'token': user.uid,'data': req.body};
          //}
          db.insert(payload);
          return res.sendStatus(204);
        } else {
          return res.send({
            'status': 'failure',
            'error': 'password or username error'
          });
        }
      });
    });
	}

	app.post(/^\/topics\/(.+)$/, function (req, res) {
		return update(req, res);
	});

	return app.put(/^\/topics\/(.+)$/, function (req, res) {
		update(req, res);	});
};
