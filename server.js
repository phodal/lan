var configure=require("./app").configure;
var _ = require('underscore');
var mqtt = require("mqtt");
var coap = require("coap");
var WebSocketServer = require('ws').Server;

start = function (opts, callback) {
  var app = configure();
  app.listen(8899, function () {
    console.log("http server run on http://localhost:8899");
  });


  if (_.include(app.config.get('modules'), 'websocket')) {
    var webSocketServer = new WebSocketServer({port: 8898});
    app.websocket(webSocketServer);
    console.log("websocket server listening on port %d", 8898);
  }

  if (_.include(app.config.get('modules'), 'coap')) {
    coap.createServer(app.coap).listen(5683, function () {
      console.log("coap server listening on port %d", 5683);
    });
  }

  if (_.include(app.config.get('modules'), 'mqtt')) {
    mqtt.createServer(app.mqtt).listen(1883, function () {
      console.log("mqtt server listening on port %d", 1883);
    });
  }
  return app;
};

if (require.main.filename === __filename) {
  start();
}

module.exports.start = start;
