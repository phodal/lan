var Database = require('../persistence/mongo');
var db = new Database();
var authCheck = require('../auth/basic');

module.exports = function (app) {
  'use strict';
  return function (client) {
    var userInfo = {};
    var self = this;

    if (!self.clients) {
      self.clients = {};
    }

    client.on('connect', function (packet) {
      client.id = packet.client;
      client.subscriptions = [];
      if (packet.username === undefined || packet.password === undefined) {
        return client.connack({
          returnCode: -1
        });
      }
      client.id = packet.client;
      var reqUserInfo = {
        name: packet.username,
        password: packet.password.toString()
      };

      var errorCB = function () {
        return client.connack({
          returnCode: -1
        });
      };

      var successCB = function (user) {
        self.clients[packet.clientId] = client;
        userInfo = user;
        client.connack({
          returnCode: 0
        });
      };

      authCheck(reqUserInfo, errorCB, successCB, errorCB);
    });

    client.on('subscribe', function (packet) {
      var granted = [];
      var i;
      for (i = 0; i < packet.subscriptions.length; i++) {
        var qos = packet.subscriptions[i].qos;
        var topic = packet.subscriptions[i].topic;
        var reg = new RegExp(topic.replace('+', '[^\/]+').replace('#', '.+') + '$');

        granted.push(qos);
        client.subscriptions.push(reg);
      }

      client.suback({messageId: packet.messageId, granted: granted});

      db.subscribe({name: userInfo.name, token: userInfo.uid}, function (result) {
        return client.publish({
          topic: userInfo.name.toString(),
          payload: JSON.stringify(result)
        });
      });
    });
    client.on('publish', function (packet) {
      var k;
      var i;
      var payload = {
        name: userInfo.name,
        token: userInfo.uid,
        data: packet.payload.toString()
      };
      db.insert(payload);

      for (k in self.clients) {
        var _client = self.clients[k];

        for (i = 0; i < _client.subscriptions.length; i++) {
          var subscription = _client.subscriptions[i];

          if (subscription.test(packet.topic)) {
            _client.publish({
              topic: packet.topic,
              payload: packet.payload.toString()
            });
            break;
          }
        }
      }
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
      delete self.clients[client.id];
    });
    return client.on('unsubscribe', function (packet) {
      return client.unsuback({
        messageId: packet.messageId
      });
    });
  };
};
