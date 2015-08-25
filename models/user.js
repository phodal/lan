var config = require('config');
var encrypt = require('./encrypt/' + config.get('encrypt'));
var uuid = require('node-uuid');

'use strict';
module.exports = function (sequelize, DataTypes) {
  function hashPasswordHook(user, options, done) {
    if (!user.changed('password')) {
      done();
    }
    encrypt.hash(user.get('password'), function (err, hash) {
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

  var Message = sequelize.define('Message', {
    name: DataTypes.STRING,
    user_id: {
      type:DataTypes.STRING,
      references: {
        model: "User",
        key: "id"
      }
    },
    uuid: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });

  var User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      references: {
        model: Message, // Can be both a string representing the table name, or a reference to the model
        key:   "name"
      },
      validate: {
        notEmpty: true,
        isUnique: function (value, next) {
          User.find({
            where: {name: value}
          }).done(function (error, user) {
            if (error) {
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
    uid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true,
      references: {
        model: Message, // Can be both a string representing the table name, or a reference to the model
        key:   "uuid"
      }
    },
    isAdmin: {
      type:DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    phone: DataTypes.STRING,
    alias: DataTypes.STRING
  }, {
    classMethods: {
      associate: function (models) {
        User.hasOne(Message,  { as: 'message' });
      },
      findByUserId: function (userid) {
        return this.find({where: {id: userid}});
      }
    },
    hooks: {
      beforeCreate: [hashPasswordHook, generateUID],
      beforeUpdate: hashPasswordHook
      //afterCreate: CreateMessage,
    },
    instanceMethods: {
      comparePassword: function (password, done) {
        return encrypt.validate(password, this.password, function (err, res) {
          return done(err, res);
        });
      }
    }
  });

  return User;
};
