var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;

var config = require('config');

//var url = 'mongodb://localhost:27017/myproject';
var url = config.get('db_url');
var mubsub = require('mubsub');

function MongoPersistence() {

}

MongoPersistence.prototype.insert = function (payload) {
  MongoClient.connect(url, function (err, db) {
    var insertDocuments = function (db, callback) {
      var collection = db.collection(config.get('db_collection'));
      collection.insert(payload, function (err, result) {
        callback(result);
      });
    };
    insertDocuments(db, function () {
      var client = mubsub(config.get('db_url'));
      var channel = client.channel('message');

      channel.publish(payload.name, payload);
      channel.close();
      db.close();
    });
  });
};

MongoPersistence.prototype.query = function (queryOptions, queryCB) {
  MongoClient.connect(url, function (err, db) {
    var findDocuments = function (db, query, callback) {
      var collection = db.collection(config.get('db_collection'));
      collection.find(query, {'data': true, '_id': false}).toArray(function (err, docs) {
        callback(docs);
      });
    };

    findDocuments(db, queryOptions, function (result) {
      db.close();
      queryCB(result);
    });
  });
};

MongoPersistence.prototype.subscribe = function (topic, callback) {
  var client = mubsub(config.get('db_url'));
  var channel = client.channel('message');

  channel.on('message', console.log);

  channel.on('document', console.log);

  channel.subscribe(topic, function (message) {
    channel.close();
    callback(message)
  });
};

MongoPersistence.prototype.unsubscribe = function (topic, callback) {
  client.close();
};

module.exports = MongoPersistence;
