var helper = require('../spec_helper');
var mqtt = require('mqtt');
var request = require('request');
var coap = require('coap');
var website = "http://localhost:8899/";
var assert = require('chai').assert;
var should = require('should');
var supertest = require('supertest');
var WebSocket = require('ws');
var WebSocketServer = WebSocket.Server;
var env = require("../../app.js");

describe('MQTT Services Test', function () {
  var app, server, coapServer, mqttServer, webSocketServer;
  app = env.configure();

  before(function () {
    server = app.listen(8899, function () {
    });
    coapServer = coap.createServer(app.coap).listen(5683, function () {
    });
    mqttServer = mqtt.createServer(app.mqtt).listen(1883, function () {
    });
    webSocketServer = new WebSocketServer({port: 8898});
    app.websocket(webSocketServer);
  });

  after(function () {
    webSocketServer.close();
    server.close();
    coapServer.close();
    mqttServer.close();
  });

  describe("MQTT Server", function () {
    it('should able connect to mqtt server', function (done) {
      var client = mqtt.createClient(1883, '127.0.0.1', {
        username: 'root',
        password: 'root'
      });

      client.on('connect', function () {
        client.publish('root', 'coap');
        client.subscribe('root');
        client.unsubscribe('root');
        client.end();
        done();
      });
    });

  });
});
