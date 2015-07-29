var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var loader = require('./loader');
var app = express();
var mqtt = require("mqtt");

configure = function () {
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'jade');

	app.use(logger('dev'));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({extended: false}));
	app.use(cookieParser());
	app.use(express.static(path.join(__dirname, 'public')));

	app.use('/', routes);

	app = loader.load(app, 'http');
	app = loader.load(app, 'mqtt');
	return app;
};

start = module.exports.start = function (opts, callback) {
	configure();
	app.listen(8080, function () {
		console.log("http web server listening on port %d mode", 8080);
	});

	mqtt.createServer(app.mqtt).listen(1883, function () {
		console.log("oap-mqtt-rest mqtt server listening on port %d", 1883);
	});
	return app;
};

if (require.main.filename === __filename) {
	start();
}

module.exports = app;
