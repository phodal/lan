var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;

var global_config = require('config');
var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../config/config.json')[env];
var sequelize = new Sequelize(config.database, config.username, config.password, config);
var db = {};
var url = global_config.get('db_url');


module.exports = function () {
  console.log("Migrate Start");
  var start = function (cb) {
    sequelize.query('SELECT * FROM "messages";',
      {replacements: ['active'], type: sequelize.QueryTypes.SELECT}
    ).then(function (projects) {
        if(projects.length <= 0) {
          return ;
        }
        console.log("Find " + projects.length + " Users Need to Sync");

        MongoClient.connect(url, function (err, db) {
            var insertDocuments = function (db, callback) {
              var collection = db.collection( global_config.get('db_collection_user'));
              collection.insert(projects, function (err, result) {
                callback(result);
              });
            };

            insertDocuments(db, function () {
              sequelize.query('DELETE FROM `Messages`').then(function(result){
                console.log(result);
              });
              db.close();
            });
          });
      })
  };
  start(function (result) {
    console.log(result);
  });
};
