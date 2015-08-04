var Database = require('../persistence/mongo');
var db = new Database();

module.exports = function (app) {
	app.get(/^\/topics\/(.+)$/, function (req, res) {
		var topic = req.params[0];
		//数据库操作
		res.json({'topic': topic});
	});

	function update(req, res) {
		//var topic = req.params[0];
    console.log("===================");
    db.insert(req.body);
		return res.sendStatus(204);
	}

	app.post(/^\/topics\/(.+)$/, function (req, res) {
		return update(req, res);
	});

	return app.put(/^\/topics\/(.+)$/, function (req, res) {
		update(req, res);	});
};
