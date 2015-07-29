module.exports.load = load = function (app, key) {
	var loadPath;
	loadPath = __dirname + ("/modules/");
	app[key] = require(loadPath + key)(app);
	return app;
};