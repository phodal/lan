var model = require('../models');
var Database = require('../persistence/mongo');
var db = new Database();

function getAuthInfo(req) {
  var encoded = req.headers.authorization.split(' ')[1];
  var decoded = new Buffer(encoded, 'base64').toString('utf8');

  var username = decoded.split(':')[0];
  var password = decoded.split(':')[1];
  return {username: username, password: password};
}

module.exports = function (app) {
  return function (server) {
    server.on('connection', function (socket) {
      if(!socket.upgradeReq.headers.authorization){
        socket.send({error: "no auth info"});
        socket.close();
      }
      var userInfo = getAuthInfo(socket.upgradeReq);
      var authInfo = {};

      model.User.findOne({where: {name: userInfo.username}}).then(function (user) {
        if (!user) {
          socket.close();
        }
        user.comparePassword(userInfo.password, function (err, result) {
          if (result) {
            socket.send("connection");
            authInfo = result;
          } else {
            socket.close();
          }
        });
      });
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
