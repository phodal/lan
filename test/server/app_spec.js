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

describe('Application Services Test', function () {
  var app, server, coapServer, mqttServer, webSocketServer;
  app = env.configure();

  before(function () {
    var models = require('../../models');
    models.User.create({
      name: 'phodal',
      password: 'phodal',
      expiration: '2016-03-03',
      uuid: '84e824cb-bfae-4d95-a76d-51103c556057',
      phone: '12345678901',
      alias: 'fengda'
    });

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

  describe("Authenticate", function () {
    var agent = supertest.agent(app);
    var agent2 = supertest.agent(app);

    it("should able load the home page", function (done) {
      agent
        .get('/')
        .expect('Content-Type', /html/)
        .expect(200, done);
    });

    it("should able goto register page", function (done) {
      agent
        .get('/register')
        .expect('Content-Type', /html/)
        .expect(200, done);
    });

    it("should redirect when visit profile without login", function (done) {
      agent
        .get('/users/root')
        .expect(302, done);
    });

    it("should able to register with lan", function (done) {
      agent
        .post('/register')
        .send({name: 'lan', password: 'lan', phone: '1234567890', alias: "something"})
        .expect(200, done);
    });

    it("should unable to register with lan", function (done) {
      agent
        .post('/register')
        .send({name: 'root', password: 'root', phone: '1234567890', alias: "something"})
        .end(function (err, res){
          done();
        })
    });

    it("should able to login with lan", function (done) {
      agent
        .post('/login')
        .send({name: 'lan', password: 'lan'})
        .expect(200, done);
    });


    it("should unable to login with lanting", function (done) {
      agent
        .post('/login')
        .send({name: 'lanting', password: 'lan'})
        .expect(302, done);
    });

    it("should able to visit user profile", function (done) {
      agent
        .get('/users/lan')
        .end(function (err, res) {
          res.statusCode.should.be.equal(200);
          done();
        });
    });

    it("should redirect to homepage", function (done) {
      agent2
        .get('/logout')
        .expect(302, done);
    });
  });
});
