var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;

var url = 'mongodb://localhost:27017/myproject';
function MongoPersistence () {

}

MongoPersistence.prototype.insert = function() {
  MongoClient.connect(url, function(err, db) {
    console.log("Connected correctly to server");
    var insertDocuments = function(db, callback) {
      var collection = db.collection('documents');
      collection.insert([
        {a : 1}, {a : 2}, {a : 3}
      ], function(err, result) {
        console.log("Inserted 3 documents into the document collection");
        callback(result);
      });
    };
    insertDocuments(db, function() {
      db.close();
    });
  });
};


module.exports = MongoPersistence;
