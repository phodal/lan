var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;

var url = 'mongodb://localhost:27017/myproject';
function MongoPersistence () {

}

MongoPersistence.prototype.insert = function(payload) {
  MongoClient.connect(url, function(err, db) {
    var insertDocuments = function(db, callback) {
      var collection = db.collection('documents');
      collection.insert(payload, function(err, result) {
        callback(result);
      });
    };
    insertDocuments(db, function() {
      db.close();
    });
  });
};


module.exports = MongoPersistence;
