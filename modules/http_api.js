module.exports = function (app) {
	app.get('/topics', function (req, res) {
		res.send("----------------");
	});

	return app.put('/topics', function (req, res) {
		return res.send(204);
	});
};
