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
  var app, server, mqttServer;
  app = env.configure();

  before(function () {
    mqttServer = mqtt.MqttServer(app.mqtt).listen(1883, function () {
    });
  });

  after(function () {
    mqttServer.close();
  });

  it('should able connect to mqtt server', function (done) {
    var client = mqtt.connect('http://127.0.0.1', {
      username: 'root',
      password: 'root'
    });

    client.on('connect', function () {
      client.publish('root', 'coap');
      //client.subscribe('root');
      //client.unsubscribe('root');
      client.end();
      done();
    });
  });
});
