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
        client.connack({
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
      var granted = [], i, qos, topic, reg;
      for (i = 0; i < packet.subscriptions.length; i++) {
        qos = packet.subscriptions[i].qos;
        topic = packet.subscriptions[i].topic;
        reg = new RegExp(topic.replace('+', '[^\/]+').replace('#', '.+') + '$');

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
      var k, i, _client, subscription, payload = {
        name: userInfo.name,
        token: userInfo.uid,
        data: packet.payload.toString()
      };
      db.insert(payload);

      for (k in self.clients) {
        _client = self.clients[k];

        for (i = 0; i < _client.subscriptions.length; i++) {
          subscription = _client.subscriptions[i];

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
