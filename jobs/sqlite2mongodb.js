var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;

var global_config = require('config');
var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../config/config.json')[env];
var sequelize = new Sequelize(config.database, config.username, config.password, config);
var db = {};
var url = global_config.get('db_url');
var _ = require('underscore');
var Q = require('q');

module.exports = function () {
  'use strict';
  var start = function () {
    sequelize.query('SELECT * FROM messages WHERE status = "create" ;',
      {replacements: ['active'], type: sequelize.QueryTypes.SELECT}
    ).then(function (projects) {
        if (projects.length <= 0) {
          return;
        }
        console.log('Find ' + projects.length + ' Users Need to Sync');

        //MongoClient.connect(url, function (err, db) {
        //  var collection = db.collection(global_config.get('db_collection_user'));
        //  var removeExistOldUser = function (cb) {
        //    for (var i = 0; i < projects.length; i++) {
        //      var user = projects[i];
        //      collection.find({name: user.name}, {'data': true, '_id': false}).toArray(function (err, docs) {
        //        console.log("User " + user.name + " already exist, try to update");
        //        if (docs !== "undefined") {
        //          collection.deleteOne({name: user.name}, function (err, result) {
        //            console.log("Remove User: " + user.name);
        //            console.log(err, result);
        //            db.close();
        //          });
        //        }
        //      });
        //      cb();
        //    }
        //  };
        //
        //  removeExistOldUser(function () {
        //    db.close();
        //  });
        //});

        MongoClient.connect(url, function (err, db) {
          var collection = db.collection(global_config.get('db_collection_user'));
          var insertUser = function (db, users, callback) {
            collection.insert(users, function (err, result) {
              callback(err, result);
            });
          };

          insertUser(db, projects, function (err) {
            sequelize.query('DELETE FROM Messages WHERE status = "create"');
            console.log('Mongodb Close');
            db.close();
          });
        });
      });
  };
  start(function (result) {
    console.log(result);
  });
}
;
