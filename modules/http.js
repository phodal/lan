var Database = require('../persistence/mongo');
var db = new Database();
var isJson = require('../utils/common').isJson;
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

module.exports = function (app) {
	app.get(/^\/topics\/(.+)$/, function (req, res) {
		var topic = req.params[0];
		//数据库操作
		res.json({'topic': topic});
	});

	function update(req, res) {
		//var topic = req.params[0];
    var payload = req.body;
    if(!isJson(payload)){
      payload = {'data': payload}
    }
    db.insert(payload);
		return res.sendStatus(204);
	}

	app.post(/^\/topics\/(.+)$/, function (req, res) {
		return update(req, res);
	});

	return app.put(/^\/topics\/(.+)$/, function (req, res) {
		update(req, res);	});
};
