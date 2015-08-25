'use strict';
module.exports = function(sequelize, DataTypes) {
  var Message = sequelize.define('Message', {
    name: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    uuid: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
      }
    }
  });

  return Message;
};
