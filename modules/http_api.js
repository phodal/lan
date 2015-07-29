module.exports = function (app) {
	app.get(/^\/topics\/(.+)$/, function (req, res) {
		var topic = req.params[0];
		//数据库操作
		res.json({'topic': topic});
	});

	function update(req, res) {
		var topic = req.params[0];
		var payload;
		if (req.is("json")) {
			payload = req.body;
		} else {
			payload = req.body.payload;
		}
		//数据库操作
		return res.sendStatus(204);
	}

	app.post(/^\/topics\/(.+)$/, function (req, res) {
		return update(req, res);
	});

	return app.put(/^\/topics\/(.+)$/, function (req, res) {
		update(req, res);	});
};
