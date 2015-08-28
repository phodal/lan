var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;

var config = require('config');

var url = config.get('db_url');

function MongoPersistence() {

}

MongoPersistence.prototype.insert = function (payload) {
  'use strict';
  MongoClient.connect(url, function (err, db) {
    var insertDocuments = function (db, callback) {
      var collection = db.collection(config.get('db_collection'));
      collection.insert(payload, function (err, result) {
        callback(result);
      });
    };
    insertDocuments(db, function () {
      db.close();
    });
  });
};

MongoPersistence.prototype.query = function (queryOptions, queryCB) {
  'use strict';
  MongoClient.connect(url, function (err, db) {
    var findDocuments = function (db, query, callback) {
      var collection = db.collection(config.get('db_collection'));
      collection.find(query, {data: true, _id: false}).toArray(function (err, docs) {
        callback(docs);
      });
    };

    findDocuments(db, queryOptions, function (result) {
      db.close();
      queryCB(result);
    });
  });
};

MongoPersistence.prototype.subscribe = function (queryOptions, queryCB) {
  'use strict';
  MongoClient.connect(url, function (err, db) {
    var subDocuments = function (db, query, callback) {
      var collection = db.collection(config.get('db_collection'));
      collection.find(query).sort({$natural: 1}).limit(1).toArray(function (err, doc) {
        callback(doc);
      });
    };

    subDocuments(db, queryOptions, function (result) {
      db.close();
      queryCB(result);
    });
  });
};

module.exports = MongoPersistence;
