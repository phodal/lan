var async, env;

env = require("../app.js");

module.exports.globalSetup = function() {
	if (this.app != null) {
		return;
	}
  this.models = require('../models');
  this.models.User.create({
    name: 'phodal',
    password: 'phodal',
    expiration: '2016-03-03',
    uuid: '84e824cb-bfae-4d95-a76d-51103c556057',
    phone: '12345678901',
    alias: 'fengda'
  })
	this.app = env.app;
	return env.configure();
};
