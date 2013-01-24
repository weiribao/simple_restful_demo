var mongo = require("mongodb");
var collection;

exports.run = function(callback){
	var mongoServer = new mongo.Server("localhost", 27017, {auto_reconnect: true}),
	db = new mongo.Db("test_db", mongoServer, {safe: false});
	db.open(function(err, db){
		if(!err){
			db.collection("example", function(err, col){
				if(!err){
					collection = col;
					callback();
					db.close();
				} else {
					db.close();
					throw err;
				}
			});
		} else {
			db.close();
			throw err;
		}
	})
}

exports.getObjects = function(callback){
	collection.find().toArray(callback);
}

exports.putObject = function(obj, callback){
	collection.save(obj, callback);
}

exports.postObject = function(obj, callback){
	collection.save(obj, callback);
}

exports.reset = function(callback){
	collection.remove({}, callback)
}
