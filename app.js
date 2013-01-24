var express = require("express"),
	app = express();

var db = require("./db.js");

// app.use(express.bodyParser());

app.get("/example", function(req, res){
	db.getObjects(function(err, results){
		if(err) {
			res.send(500);
		} else {
			res.send(results.map(function(result){
				var ret = {};
				for(var key in result){
					if(key[0]!=="_"){
						ret[key]=result[key];
					}
				}
				return ret;
			}));
		}
	});
});

app.put("/example", function(req, res){
	var body = "";
	req.on("data", function(data){
		body+=data;
	});
	req.on("end", function(){
		var newObj;
		try{
			newObj = JSON.parse(body);
		} catch (err){
			return res.send(400); // Bad request
		} 
		db.putObject(newObj, function(err){
			res.send(err ? 500 : 200);
		})
	})
});

app.post("/example", function(req, res){
	var body = "";
	req.on("data", function(data){
		body += data;
	});
	req.on("end", function(){
		var newObj;
		try{
			newObj = JSON.parse(body);
		} catch (err){
			return res.send(400); // Bad request
		} 
		db.postObject(newObj, function(err){
			res.send(err ? 500 : 200);
		})
	})
})

// for testing purpose
// remove all objects
app.delete("/example", function(req, res){
	db.reset(function(err){
		if(err){
			res.send(500);
		} else {
			res.send(200);
		}
	})
})

db.run(function(){
	app.listen(8000);
});