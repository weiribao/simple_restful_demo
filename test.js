var request = require("request"),
	assert = require("assert"),
	async  = require("async");

var samples = [{
        "id": "a28fcb12",
        "workflowType": "collection",
        "profileId": "php-crs-reports",
        "state": "collected",
        "stateType": "terminal",
        "timestamp": "2012-02-01T12:34:21Z",
        "duration": 825
},
{
        "id": "g122fb97",
        "workflowType": "collection",
        "profileId": "gpo-bill-digest",
        "state": "invalid",
        "stateType": "wait",
        "message": "The identical file has been collected",
        "timestamp": "2012-02-03T12:32:21Z",
        "duration": 21
},
{
        "id": "c82b2d12",
        "workflowType": "collection",
        "profileId": "gpo-bill-digest",
        "state": "invalid",
        "stateType": "wait",
        "message": "The identical file has been collected",
        "timestamp": "2012-02-01T11:14:21Z",
        "duration": 12
},
{
        "id": "2d3efada",
        "workflowType": "delivery",
        "profileId": "cq-bill-digest",
        "state": "invalid",
        "stateType": "wait",
        "message": "The content of element type 'summary' must match (p)+'",
        "timestamp": "2012-01-12T12:34:21Z",
        "duration": 825
},
{
        "id": "2fcb84a9",
        "workflowType": "collection",
        "profileId": "php-crs-reports",
        "state": "collected",
        "stateType": "terminal",
        "timestamp": "2012-03-01T17:34:21Z",
        "duration": 825
}].sort(function(a,b){
	return a.id < b.id;
})

//
// helper functions
//

// callback()
function putObject(obj, callback){
	request({
		method: "put",
		uri: "http://localhost:8000/example",
		body: JSON.stringify(obj)
	}, function(err, res, body){
		assert(!err);
		assert.equal(res.statusCode, 200);
		callback();
	});
}

// callback()
function postObject(obj, callback){
	request({
		method: "put",
		uri: "http://localhost:8000/example",
		body: JSON.stringify(obj)
	}, function(err, res, body){
		assert(!err, err);
		assert.equal(res.statusCode, 200);
		callback();
	});
}

// callback(results)
function getObjects(callback){
	request.get("http://localhost:8000/example", function(err, res, body){
		assert(!err);
		assert.equal(res.statusCode, 200);
		results = JSON.parse(body);
		callback(results);
	});
}

// callback()
function reset_db(callback){
	request.del("http://localhost:8000/example", function(err, res, body){
		assert(!err);
		assert.equal(res.statusCode, 200);
		callback();
	})
}

//
// Tests
//

// test helper functions
function test_db(callback){
	async.series([
		reset_db,
		function(cb){
			getObjects(function(results){
				assert(results.length===0);
				cb();
			})
		},
		function(cb){
			putObject({foo:"bar"}, cb);
		},
		function(cb){
			getObjects(function(results){
				assert.deepEqual(results, [{foo:"bar"}], results);
				cb();
			})
		},
		function(cb){
			reset_db(cb);
		},
		function(cb){
			getObjects(function(results){
				assert.deepEqual(results, []);
				cb();
			})
		},
		function(cb){
			callback();
		}
		]);
}

// test POST
function test_post(callback){
	async.series([
		reset_db,
		function(cb){
			async.forEach(samples, postObject, function(err){
				assert(!err);
				getObjects(function(results){
					results.sort(function(a,b){
						return a.id < b.id;
					});
					assert.deepEqual(results, samples, results);
					cb();
				});
			});
		},
		function(cb){
			callback();
		}
		])
}

// test PUT
function test_put(callback){
	async.series([
		reset_db,
		function(cb){
			async.forEach(samples, putObject, function(err){
				getObjects(function(results){
					results.sort(function(a,b){
						return a.id < b.id;
					});					
					assert.deepEqual(results, samples, results);
					cb();
				});
			});
		},
		function(cb){
			callback();
		}
		])
}

// test that invalid input doesn't crash the server
function test_invalid_put(callback){
	request({
		method: "put",
		uri: "http://localhost:8000/example",
		body: "Invalid JSON"
	}, function(err, res, body){
		assert(!err);
		assert(res.statusCode===400);
		callback();
	});
}

// test that there can be duplicate objects in database
function test_duplicate(callback){
	async.series([
		reset_db,
		function(cb){
			putObject(samples[0], cb);
		},
		function(cb){
			putObject(samples[0], cb);
		},
		function(cb){
			getObjects(function(results){
				assert(results.length===2);
				cb();
			});
		},
		function(cb){
			callback();
		}
		])
}

//
// Run tests
//

async.series([
	test_db,
	test_invalid_put,
	test_post,
	test_put,
	test_duplicate,
	function(){
		console.log("All tests passed. ");
	}
])
