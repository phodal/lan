var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;

var global_config = require('config');
var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../config/config.json')[env];
var sequelize = new Sequelize(config.database, config.username, config.password, config);
var db = {};
var url = global_config.get('db_url');
var _ = require("underscore");

module.exports = function () {
  var start = function (cb) {
    sequelize.query('SELECT * FROM "messages";',
      {replacements: ['active'], type: sequelize.QueryTypes.SELECT}
    ).then(function (projects) {
        if (projects.length <= 0) {
          return;
        }
        console.log("Find " + projects.length + " Users Need to Sync");

        MongoClient.connect(url, function (err, db) {
          var findUser = function (db, query, callback) {
            var collection = db.collection(global_config.get('db_collection_user'));
            collection.find(query, {'data': true, '_id': false}).toArray(function (err, docs) {
              callback(docs);
            });
          };

          var insertUser = function (db, project, callback) {
            var collection = db.collection(global_config.get('db_collection_user'));
            collection.insert(project, function (err, result) {
              callback(err, result);
            });
          };

          _.each(projects, function (project) {
            findUser(db, {name: project.name}, function (result) {
              if (result === undefined || result === []) {
                insertUser(db, project, function (err) {
                  if (!err) {
                    sequelize.query('DELETE FROM Messages WHERE NAME = "' + project.name + '";').then(function (result) {
                      console.log(result);
                    });
                  } else {
                    console.log("--------------------------------------");
                    console.log(err);
                  }
                });
              }
            });
          });

          console.log("Mongodb Close");
          db.close();
        });
      })
  };
  start(function (result) {
    console.log(result);
  });
};
