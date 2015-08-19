var Database = require('../persistence/mongo');
var db = new Database();
var isJson = require('../utils/common').isJson;
var model = require('../models');

module.exports = function (app) {
	return function (client) {
    var auth = {};
    var unsubscribeAll = function() {

    };


		client.on('connect', function (packet) {
      auth['name'] = packet.username;
      auth['password'] = packet.password.toString();
			client.id = packet.client;
			return client.connack({
				returnCode: 0
			});
		});
		client.on('subscribe', function (packet) {
			console.log('subscribe');
			return {status: 'subscribe'};
		});
		client.on('publish', function (packet) {
      model.User.findOne({where: {name: auth.name}}).then(function (user) {
        if(!user){
          return {};
        }
        user.comparePassword(auth.password, function(err, result){
          if(result) {
            var payload = {'name': user.name, 'token': user.uid,'data': packet.payload.toString()};
            db.insert(payload);
          } else {
            return {
              'status': 'failure',
              'error': 'password or username error'
            };
          }
        });
      });
		});
		client.on('pingreq', function (packet) {
      return client.pingresp();
		});
		client.on('disconnect', function () {
      return client.stream.end();
		});
		client.on('error', function (error) {
      return client.stream.end();
		});
		client.on('close', function (err) {
      return unsubscribeAll();
		});
		return client.on('unsubscribe', function (packet) {
      return client.unsuback({
        messageId: packet.messageId
      });
		});
	};
};
