var bcrypt = require('bcrypt');

'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    name: DataTypes.STRING,
    password: DataTypes.STRING,
    expiration: DataTypes.DATE,
    uid: DataTypes.UUID,
    phone: DataTypes.STRING,
    alias: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });

  function hashPasswordHook(user, options, done) {
    if (!user.changed('password')) {
      done();
    }
    bcrypt.hash(user.get('password'), 10, function(err, hash) {
      if (err) {
        done(err);
      }
      user.set('password', hash);
      done();
    });
  }
  
  User.beforeCreate(hashPasswordHook);
  User.beforeUpdate(hashPasswordHook);

  return User;
};