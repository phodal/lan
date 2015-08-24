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

describe('CoAP Services Test', function () {
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


  describe("CoAP Server", function () {
    it('should able connect to coap server', function (done) {
      var request = coap.request;
      var bl = require('bl');
      var req = request({hostname: 'localhost', port: 5683, pathname: 'topic', method: 'GET', query: 'root:root'});

      req.on('response', function (res) {
        if (res.code === '2.05') {
          done();
        }
      });

      req.end();
    });

    it('should unable connect to coap server when username error', function (done) {
      var req = coap.request('coap://localhost/topic?phodal1:phodal');

      req.on('response', function (res) {
        if (res.code === '4.03') {
          done();
        }
      });

      req.end();
    });

    it('should unable connect to coap server when not exist auth', function (done) {
      var req = coap.request('coap://localhost/hello');

      req.on('response', function (res) {
        if (res.code === '4.00') {
          done();
        }
      });

      req.end();
    });

    it('should unable connect to coap server when password error', function (done) {
      var req = coap.request('coap://localhost/topic?phodal:root');

      req.on('response', function (res) {
        if (res.code === '4.03') {
          done();
        }
      });

      req.end();
    });

    it('should return not support when try delete method', function (done) {
      var request = coap.request;
      var req = request({hostname: 'localhost', port: 5683, pathname: '', method: 'DELETE'});

      req.on('response', function (res) {
        if (JSON.parse(res.payload.toString()).method === "not support") {
          done();
        }
      });

      req.end();
    });

    it('should able to post data with auth', function (done) {
      var request = coap.request;
      var bl = require('bl');
      var req = request({hostname: 'localhost', port: 5683, pathname: 'topic', method: 'POST', query: 'phodal:phodal'});

      var payload = {
        title: 'this is a test payload',
        body: 'containing nothing useful'
      };

      req.setHeader("Accept", "application/json");
      req.write(JSON.stringify(payload));
      req.on('response', function (res) {
        if (res.code === '2.01') {
          done();
        }
      });

      req.end();
    });

    it('should not able to post data with auth', function (done) {
      var request = coap.request;
      var bl = require('bl');
      var req = request({hostname: 'localhost', port: 5683, pathname: 'topic', method: 'POST', query: 'phodal:root'});

      var payload = {
        title: 'this is a test payload',
        body: 'containing nothing useful'
      };

      req.setHeader("Accept", "application/json");
      req.write(JSON.stringify(payload));
      req.on('response', function (res) {
        if (res.code === '4.03') {
          done();
        }
      });

      req.end();
    });

    it('should able to put data with auth', function (done) {
      var request = coap.request;
      var bl = require('bl');
      var req = request({hostname: 'localhost', port: 5683, pathname: 'topic', method: 'PUT', query: 'phodal:phodal'});

      var payload = {
        title: 'this is a test payload',
        body: 'containing nothing useful'
      };

      req.setHeader("Accept", "application/json");
      req.write(JSON.stringify(payload));
      req.on('response', function (res) {
        if (res.code === '2.01') {
          done();
        }
      });

      req.end();
    });

    it('should able to put data with username error', function (done) {
      var request = coap.request;
      var bl = require('bl');
      var req = request({hostname: 'localhost', port: 5683, pathname: 'topic', method: 'PUT', query: 'root:phodal'});

      var payload = {
        title: 'this is a test payload',
        body: 'containing nothing useful'
      };

      req.setHeader("Accept", "application/json");
      req.write(JSON.stringify(payload));
      req.on('response', function (res) {
        if (res.code === '4.03') {
          done();
        }
      });

      req.end();
    });
  });
});
