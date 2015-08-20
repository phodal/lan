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

describe('Application Services Test', function () {
  var app, server, coapServer, mqttServer, webSocketServer;
  app = helper.globalSetup();

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

  describe("MQTT Server", function () {
    it('should able connect to mqtt server', function (done) {
      var client = mqtt.createClient(1883, '127.0.0.1', {
        username: 'root',
        password: 'root'
      });

      client.on('connect', function () {
        client.publish('hello', 'coap');
        client.end();
        done();
      });
    });

  });

  describe("HTTP Server", function () {
    it('should able open homepage', function (done) {
      request.get('http://localhost:8899/',
        function (error, response, body) {
          if (response.statusCode === 200) {
            done();
          }
        })
    });

    it('should able connect to http server', function (done) {
      request.get('http://localhost:8899/topics/test', {
          'auth': {
            'username': 'root',
            'password': 'root'
          }
        },
        function (error, response, body) {
          if (response.statusCode === 200) {
            done();
          }
        })
    });

    it('should unable connect to http server when username error', function (done) {
      request.get('http://localhost:8899/topics/test', {
          'auth': {
            'username': 'root1',
            'password': 'phodal'
          }
        },
        function (error, response, body) {
          if (response.statusCode === 403) {
            done();
          }
        })
    });

    it('should unable connect to http server when password error', function (done) {
      request.get('http://localhost:8899/topics/test', {
          'auth': {
            'username': 'root',
            'password': 'phodal'
          }
        },
        function (error, response, body) {
          if (response.statusCode === 403) {
            done();
          }
        })
    });

    it('should return 401 when user not auth', function (done) {
      request('http://localhost:8899/topics/test',
        function (error, response, body) {
          if (response.statusCode === 401) {
            done();
          }
        })
    });


    it('should able put response', function (done) {
      request({
        uri: 'http://phodal:phodal@localhost:8899/topics/test',
        method: 'PUT',
        multipart: [
          {
            'content-type': 'application/json',
            body: JSON.stringify({
              foo: 'bar',
              _attachments: {'message.txt': {follows: true, length: 18, 'content_type': 'text/plain'}}
            })
          },
          {body: 'I am an attachment'}]
      }, function (error, response, body) {
        if (response.statusCode) {
          done();
        }
      })
    });

    it('should able put response', function (done) {
      request.put('http://localhost:8899/topics/test', {
        'auth': {
          'username': 'phodal',
          'password': 'phodal',
          'sendImmediately': true
        }
      }, function (error, response, body) {
        if (response.statusCode === 204) {
          done();
        }
      });
    });

    it('should able put response when username error', function (done) {
      request.put('http://localhost:8899/topics/test', {
        'auth': {
          'username': 'phodal1',
          'password': 'phodal',
          'sendImmediately': true
        }
      }, function (error, response, body) {
        if (response.statusCode === 403) {
          done();
        }
      })
    });

    it('should not able put response when password error', function (done) {
      request.put('http://localhost:8899/topics/test', {
        'auth': {
          'username': 'phodal',
          'password': 'root',
          'sendImmediately': true
        }
      }, function (error, response, body) {
        if (response.statusCode === 403) {
          done();
        }
      })
    });

    it('should able post response', function (done) {
      request({
        uri: 'http://localhost:8899/topics/test',
        method: 'POST',
        'auth': {
          'username': 'phodal',
          'password': 'phodal',
          'sendImmediately': true
        }
      }, function (error, response, body) {
        if (response.statusCode === 204) {
          done();
        }
      })
    });
  });

  describe("CoAP Server", function () {
    it('should able connect to coap server', function (done) {
      var req = coap.request('coap://localhost/hello');

      req.setOption('Block2', [new Buffer('phodal'), new Buffer('phodal')]);
      req.on('response', function (res) {
        if (res.code === '2.06') {
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

    it('should abe to post data with auth', function (done) {
      var request = coap.request;
      var bl = require('bl');
      var req = request({hostname: 'localhost', port: 5683, pathname: '', method: 'POST'});

      var payload = {
        title: 'this is a test payload',
        body: 'containing nothing useful'
      };

      req.setHeader("Accept", "application/json");
      req.setOption('Block2', [new Buffer('phodal'), new Buffer('phodal')]);
      req.write(JSON.stringify(payload));
      req.on('response', function (res) {
        if (res.code === '2.06') {
          done();
        }
      });

      req.end();
    });

    it('should not able to post data with auth', function (done) {
      var request = coap.request;
      var bl = require('bl');
      var req = request({hostname: 'localhost', port: 5683, pathname: '', method: 'POST'});

      var payload = {
        title: 'this is a test payload',
        body: 'containing nothing useful'
      };

      req.setHeader("Accept", "application/json");
      req.setOption('Block2', [new Buffer('phodal'), new Buffer('root')]);
      req.write(JSON.stringify(payload));
      req.on('response', function (res) {
        if (res.code === '4.04') {
          done();
        }
      });

      req.end();
    });

    it('should abe to put data with auth', function (done) {
      var request = coap.request;
      var bl = require('bl');
      var req = request({hostname: 'localhost', port: 5683, pathname: '', method: 'PUT'});

      var payload = {
        title: 'this is a test payload',
        body: 'containing nothing useful'
      };

      req.setHeader("Accept", "application/json");
      req.setOption('Block2', [new Buffer('phodal'), new Buffer('phodal')]);
      req.write(JSON.stringify(payload));
      req.on('response', function (res) {
        if (res.code === '2.06') {
          done();
        }
      });

      req.end();

    });
  });

  describe('WebSocket', function () {
    it('basic connection', function (done) {
      var ws = new WebSocket('ws://localhost:8898/');

      ws.on('open', function open() {
        ws.send('something');
        console.log('open');
      });

      ws.on('message', function(data) {
        if(data==="connection") {
          done();
        }
      });
    });
  });
});
