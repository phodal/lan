var bcrypt = require('bcrypt');
var uuid = require('node-uuid');

'use strict';
module.exports = function (sequelize, DataTypes) {
  function hashPasswordHook(user, options, done) {
    if (!user.changed('password')) {
      done();
    }
    bcrypt.hash(user.get('password'), 10, function (err, hash) {
      if (err) {
        done(err);
      }
      user.set('password', hash);
      done();
    });
  }

  function generateUID(user, options, done) {
    user.set('uid', uuid.v4());
    done();
  }

  var User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        isUnique: function (value, next) {
          User.find({
            where: {name: value}
          }).done(function (error, user) {
            if (error) {
              console.log(error);
              return next(error)
            }
            if (user) {
              console.log('Username is already in use!');
              return next('Username is already in use!')
            }
            next()
          })
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    expiration: DataTypes.DATE,
    uid: DataTypes.UUID,
    phone: DataTypes.STRING,
    alias: DataTypes.STRING
  }, {
    classMethods: {
      associate: function (models) {
        // associations can be defined here
      },
      findByUserId: function (userid) {
        return this.find({where: {id: userid}});
      }
    },
    hooks: {
      beforeCreate: [hashPasswordHook, generateUID],
      beforeUpdate: hashPasswordHook
    },
    instanceMethods: {
      comparePassword: function (password, done) {
        return bcrypt.compare(password, this.password, function (err, res) {
          return done(err, res);
        });
      }
    }
  });

  return User;
};
