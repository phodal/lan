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
var bl = require('bl');

describe('CoAP Services Test', function () {
  var app, server, coapServer;
  app = env.configure();

  before(function () {
    coapServer = coap.createServer(app.coap).listen(5683, function () {
    });
  });

  after(function () {
    coapServer.close();
  });

  it('should able connect to coap server', function (done) {
    var request = coap.request;
    var req = request({hostname: 'localhost', port: 5683, pathname: 'device', method: 'GET', query: 'root:root'});

    req.on('response', function (res) {
      if (res.code === '2.05') {
        done();
      }
    });

    req.end();
  });

  it('should unable connect to coap server when username error', function (done) {
    var req = coap.request('coap://localhost/device?phodal1:phodal');

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
    var req = coap.request('coap://localhost/device?phodal:root');

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
    var req = request({hostname: 'localhost', port: 5683, pathname: 'device/phodal', method: 'POST', query: 'phodal:phodal'});

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
    var req = request({hostname: 'localhost', port: 5683, pathname: 'device/phodal', method: 'POST', query: 'phodal:root'});

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

  it('should able to POST data with auth', function (done) {
    var request = coap.request;
    var req = request({hostname: 'localhost', port: 5683, pathname: 'device/2', method: 'POST', query: 'phodal:phodal'});

    var payload = {
      device: "this is device 2"
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

  it('should unable to POST data with username error', function (done) {
    var request = coap.request;
    var req = request({hostname: 'localhost', port: 5683, pathname: 'device/1', method: 'POST', query: 'root:phodal'});

    var payload = {
      device: 'this is a device 1'
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

  it('should return phodal"s device 2 result', function (done) {
    var request = coap.request;
    var req = request({hostname: 'localhost', port: 5683, pathname: 'device/2', method: 'GET', query: 'phodal:phodal'});

    req.on('response', function (res) {
      var topicResult = JSON.parse(res.payload.toString()).result[0].data;
      if (JSON.parse(topicResult).device === "this is device 2") {
        done();
      }
    });

    req.end();
  });

  it('should not return root"s device 2 result', function (done) {
    var request = coap.request;
    var req = request({hostname: 'localhost', port: 5683, pathname: 'device/2', method: 'GET', query: 'root:root'});

    req.on('response', function (res) {
      var topicResult = JSON.parse(res.payload.toString()).result;
      if (topicResult.toString() === "") {
        done();
      }
    });

    req.end();
  });

  it('should able to update data with auth', function (done) {
    var request = coap.request;
    var req = request({hostname: 'localhost', port: 5683, pathname: 'device/2', method: 'PUT', query: 'phodal:phodal'});
    req.write(JSON.stringify({topic: "this is device UPDATE"}));
    req.on('response', function (res) {
      if (res.code === '2.00') {
        done();
      }
    });
    req.end();
  });
});
