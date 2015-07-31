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
  return User;
};