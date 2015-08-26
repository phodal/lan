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
      var userInfo = getAuthInfo(socket.upgradeReq);
      model.User.findOne({where: {name: userInfo.username}}).then(function (user) {
        if (!user) {
          socket.close();
        }
        user.comparePassword(userInfo.password, function (err, result) {
          if (result) {
            db.subscribe({name: result.name, token: result.uid}, function (dbResult) {
              socket.send(JSON.stringify(dbResult));
            });
          } else {
            socket.close();
          }
        });
      });
      socket.on('subscribe', function (topic) {

      });
      return socket.on('disconnect', function () {
        console.log('disconnect');
      });
    })
  };
};
