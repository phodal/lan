var model = require('../models');
var Database = require('../persistence/mongo');
var db = new Database();
var authCheck = require('../auth/basic');

function getAuthInfo(req) {
  var encoded = req.headers.authorization.split(' ')[1];
  var decoded = new Buffer(encoded, 'base64').toString('utf8');

  var username = decoded.split(':')[0];
  var password = decoded.split(':')[1];
  return {name: username, password: password};
}

module.exports = function (app) {
  return function (server) {
    server.on('connection', function (socket) {
      if(!socket.upgradeReq.headers.authorization || socket.upgradeReq.headers.authorization === undefined){
        socket.send(JSON.stringify({error: "no auth"}));
        return socket.close();
      }
      var userInfo = getAuthInfo(socket.upgradeReq);
      var authInfo = {};

      var noUserCB = function () {
        socket.send(JSON.stringify({error: "auth failure"}));
        socket.close();
      };

      var errorCB = function () {
        socket.send(JSON.stringify({error: "auth failure"}));
        socket.close();
      };

      var successCB = function (result) {
        socket.send("connection");
        authInfo = result;
      };

      authCheck(userInfo, noUserCB, successCB, errorCB);

      socket.on('subscribe', function (topic) {
        db.subscribe({name: authInfo.name, token: authInfo.uid}, function (dbResult) {
          socket.send(JSON.stringify(dbResult));
        });
      });
      return socket.on('disconnect', function () {
        console.log('disconnect');
      });
    })
  };
};
