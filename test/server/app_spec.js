var helper = require('../spec_helper');
var mqtt = require('mqtt');
var request = require('request');
var coap = require('coap');

describe('Application', function () {
	var app, server, coapServer, mqttServer;
	before(function () {
		app = helper.globalSetup();
		server = app.listen(8899, function () {});
		coapServer = coap.createServer(app.coap).listen(5683, function () {});
		mqttServer = mqtt.createServer(app.mqtt).listen(1883, function () {});
	});

	after(function () {
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
				client.publish('hello', 'coap');
				client.end();
				done();
			});
		});

	});

	describe("HTTP Server", function () {
		it('should able connect to http server', function (done) {
			request('http://localhost:8899', function (error, response, body) {
				if (response.statusCode === 200) {
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
          { body: 'I am an attachment' }]
      }, function (error, response, body) {
        console.log(body);
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
			var result = {"method": "get"};

			req.on('response', function (res) {
				var response_result = JSON.parse(res.payload.toString());
				if (response_result.method === result.method) {
					done();
				}
			});

			req.end();
		});

    it('should return not support when try delete method', function (done) {
      var request  = coap.request;
      var req = request({hostname: 'localhost',port:5683,pathname: '',method: 'DELETE'});

			req.on('response', function (res) {
        if(JSON.parse(res.payload.toString()).method === "not support") {
          done();
        }
			});

			req.end();
		});

    it('should abe to post data with auth', function (done) {
      var request  = coap.request;
      var bl       = require('bl');
      var req = request({hostname: 'localhost',port:5683,pathname: '',method: 'POST'});

      var payload = {
        title: 'this is a test payload',
        body: 'containing nothing useful'
      };

      req.setHeader("Accept", "application/json");
      req.setOption('Block2',  [new Buffer('phodal'), new Buffer('phodal')]);
      req.write(JSON.stringify(payload));
      req.on('response', function(res) {
        if(res.code === '2.06') {
          done();
        }
      });

      req.end();
    });

    it('should not able to post data with auth', function (done) {
      var request  = coap.request;
      var bl       = require('bl');
      var req = request({hostname: 'localhost',port:5683,pathname: '',method: 'POST'});

      var payload = {
        title: 'this is a test payload',
        body: 'containing nothing useful'
      };

      req.setHeader("Accept", "application/json");
      req.setOption('Block2',  [new Buffer('phodal'), new Buffer('root')]);
      req.write(JSON.stringify(payload));
      req.on('response', function(res) {
        if(res.code === '4.04') {
          done();
        }
      });

      req.end();
    });

    it('should abe to put data with auth', function (done) {
      var request  = coap.request;
      var bl       = require('bl');
      var req = request({hostname: 'localhost',port:5683,pathname: '',method: 'PUT'});

      var payload = {
        title: 'this is a test payload',
        body: 'containing nothing useful'
      };

      req.setHeader("Accept", "application/json");
      req.setOption('Block2',  [new Buffer('phodal'), new Buffer('phodal')]);
      req.write(JSON.stringify(payload));
      req.on('response', function(res) {
        if(res.code === '2.06') {
          done();
        }
      });

      req.end();

    });
	});
});
