var helper = require('../spec_helper');
var expect = require('chai').expect;
var sinon = require('sinon');
var mqtt = require('mqtt');
var Model = require('../../models/basic');
var request = require('request');
var coap = require('coap');

describe('Application', function () {
	var models;
	models = null;
	before(function () {
		helper.globalSetup();
	});

	it('should able connect to mqtt server', function (done) {
		var client = mqtt.connect('mqtt://127.0.0.1');
		var model = new Model();
		sinon.spy(model, "findOrCreate");

		client.on('connect', function () {
			client.publish('hello', 'coap');
			client.end();
			expect(model.findOrCreate.calledOnce);
			done();
		});
	});
	it('should able connect to http server', function (done) {
		request('http://localhost:8080', function (error, response, body) {
			if (response.statusCode === 200) {
				done();
			}
		})
	});

	it('should able connect to coap server', function (done) {
		var req = coap.request('coap://localhost/hello');
		var result = {"method":"get"};

		req.on('response', function(res) {
			var response_result = JSON.parse(res.payload.toString());
			if(response_result.method === result.method){
				done();
			}
		});

		req.end();
	});
});
