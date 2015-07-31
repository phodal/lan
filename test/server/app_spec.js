var helper = require('../spec_helper');
var expect = require('chai').expect;
var sinon = require('sinon');
var mqtt = require('mqtt');
var Model = require('../../models/basic');

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

		client.on('connect', function(){
			client.publish('hello', 'coap');
			client.end();
			expect(model.findOrCreate.calledOnce);
			done();
		});
	});
});
