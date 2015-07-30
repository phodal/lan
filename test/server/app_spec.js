var expect, helper;
helper = require("../spec_helper");
expect = require('chai').expect;

describe("Application", function () {
	var models;
	models = null;
	before(function () {
		helper.globalSetup();
	});

	it("should pass test", function () {
		return expect(true).to.true;
	});
});
