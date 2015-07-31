'use strict';

var Bluebird = require('bluebird');
var expect = require('chai').expect;

describe('User Model', function () {
	beforeEach(function () {
		this.models = require('../../models');

		return Bluebird.all([
			this.models.User.destroy({truncate: true})
		]);
	});

	it('lists a user if there is one', function (done) {
		this.models.User.create({
			name: 'phodal',
			password: 'phodal',
			expiration: '2016-03-03',
			uuid: '84e824cb-bfae-4d95-a76d-51103c556057',
			phone: '12345678901',
			alias: 'fengda'
		}).then(function () {
			done();
		})
	});
});