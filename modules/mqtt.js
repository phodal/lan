var Database = require('../persistence/mongo');
var db = new Database();
var isJson = require('../utils/common').isJson;
var model = require('../models');
var authCheck = require('../auth/basic');

module.exports = function (app) {
  'use strict';
  return function (client) {
    var userInfo = {};
    var unsubscribeAll = function () {

    };

    client.on('connect', function (packet) {
      client.id = packet.client;
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
        userInfo = user;
        client.connack({
          returnCode: 0
        });
      };

      authCheck(reqUserInfo, errorCB, successCB, errorCB);
    });

    client.on('subscribe', function (packet) {
      db.subscribe({name: userInfo.name, token: userInfo.uid}, function (result) {
         return client.publish({
           topic: userInfo.name.toString(),
           payload: JSON.stringify(result)
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
