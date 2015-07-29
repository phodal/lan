module.exports.load = load = function (app, key) {
	console.log('key');
	var loadPath;
	loadPath = __dirname + ("/modules/");
	app[key] = require(loadPath + key)(app);
	return app;
};