var Database = require('../persistence/mongo');
var db = new Database();
var isJson = require('../utils/common').isJson;
var model = require('../models');

module.exports = function (app) {
  return function (client) {
    var auth = {};
    var userInfo = {};
    var unsubscribeAll = function () {

    };

    client.on('connect', function (packet) {
      if (packet.username === undefined || packet.password === undefined) {
        return client.connack({
          returnCode: -1
        });
      }
      auth['name'] = packet.username;
      auth['password'] = packet.password.toString();
      client.id = packet.client;
      model.User.findOne({where: {name: auth.name}}).then(function (user) {
        if (!user) {
          return client.connack({
            returnCode: -1
          });
        }
        userInfo = user;
        user.comparePassword(auth.password, function (err, result) {
          return client.connack({
            returnCode: 0
          });
        });
      });
    });
    client.on('subscribe', function (packet) {

      client.suback({
        messageId: packet.messageId
      });

      db.subscribe(userInfo.name, function (result) {
        console.log("mqtt subscribe:", result);
        return client.publish({
          topic: userInfo.name,
          payload: result
        });
      });
    });
    client.on('publish', function (packet) {
      var payload = {'name': userInfo.name, 'token': userInfo.uid, 'data': packet.payload.toString()};
      db.insert(payload);
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
