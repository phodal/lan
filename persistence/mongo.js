var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;

var config = require('config');

//var url = 'mongodb://localhost:27017/myproject';
var url = config.get('db_url');

function MongoPersistence () {

}

MongoPersistence.prototype.insert = function(payload) {
  MongoClient.connect(url, function(err, db) {
    var insertDocuments = function(db, callback) {
      var collection = db.collection(config.get('db_collection'));
      collection.insert(payload, function(err, result) {
        callback(result);
      });
    };
    insertDocuments(db, function() {
      db.close();
    });
  });
};

MongoPersistence.prototype.query = function(queryOptions, queryCB) {
  MongoClient.connect(url, function(err, db) {
    var findDocuments = function(db, query, callback) {
      var collection = db.collection(config.get('db_collection'));
      collection.find(query, {'data': true, '_id': false}).toArray(function(err, docs) {
        callback(docs);
      });
    };

    findDocuments(db, queryOptions, function(result) {
      db.close();
      queryCB(result);
    });
  });
};


module.exports = MongoPersistence;
