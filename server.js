var http = require('http');
var url  = require('url');
var fs = require('fs');
var formidable = require('formidable');
var MongoClient = require('mongodb').MongoClient; 
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var session = require('cookie-session');
var bodyP = require('body-parser');
const mongourl = 'mongodb://Samuel:Killer000@ds251362.mlab.com:51362/guiterman';
var express = require('express');
var app = express();

app.use(bodyP.json());
app.use(bodyP.urlencoded({
	extended: true
}));
app.use(express.static('public'));

app.set('view engine', 'ejs');

var users;
var loginedUser;
var displayid = "";
var rateuser = [];
var updateRestOwner = "";

app.use(session({
  name: 'session',
  keys: ["ggg","fff"]
}));

app.get('/loginpre',function(req,res) {
	userAccount(res);
	console.log("User get");
	res.redirect('/login');
});

app.get('/login',function(req,res) {
	res.render('loginForm', {});
});
app.post('/login',function(req,res) {
	req.session.authenticated = false;
	console.log('Incoming request: %s', req.path);
	console.log(users);
	for (var i=0; i<users.length; i++) {
		if (users[i].name == req.body.name &&
			users[i].password == req.body.password) {
				req.session.authenticated = true;
				req.session.username = users[i].name;
				console.log("authenticated user: " + users[i].name);
				loginedUser = users[i].name;
		}
	}
	if(req.session.authenticated){
		res.redirect('/index');
	}else{
		res.send("No Such User.");
	}
}); // login

app.get('/logout',function(req,res) {
	req.session = null;
	res.redirect('/login');
}); // logout

app.get('/index', function(req, res) {
	console.log('Incoming request: %s', req.path);
	read_n_print(res,{},10);
	
}); // index


app.get('/display', function(req, res) {
	console.log('Incoming request: %s', req.path);
	displayid = req.query._id;
	console.log("Finding id:" + displayid);
	displayRestaurant(res,displayid)
	
	
}); // displayfurtherdetails


app.get('/create', function(req, res) {
	res.render('createRestaurantForm', {});
});


app.post('/create', function(req, res) {
	console.log('Incoming request: post %s', req.path);
	 if (req.query.restaurant_id != "" && req.query.restaurant_id != null) {
	 	console.log("Data Recived");
	 }
		create(res,req.query,req);
		res.redirect("/index");

	
}); // Create Restaurant Form

app.get('/search', function(req, res) {
	res.render('searchForm', {});
}); // Search Restaurant Form

app.post('/search', function(req, res) {
	console.log('Incoming request: post %s', req.path);
	console.log("pass successful");

	var criteria = {};
	var new_r = {};	// document to be inserted
		var form = new formidable.IncomingForm();
	    form.parse(req, function (err, fields, files) {

	      if (fields.restaurant_id) {new_r.restaruant_id = fields.restaurant_id};
		  if (fields.name) {new_r.name = fields.name};
		  if (fields.borough) {new_r.borough = fields.borough};
		  if (fields.cuisine) {new_r.cuisine = fields.cuisine};
	      if (fields.building) {new_r.building = fields.building};
	      if (fields.coordx) {new_r.coordx = fields.coordx};
	      if (fields.coordy) {new_r.coordy = fields.coordy};
	      if (fields.street) {new_r.street = fields.street};
	      if (fields.zipcode) {new_r.zipcode = fields.zipcode};
	      if (fields.user) {new_r.user = fields.user};
	      if (fields.score) {new_r.score = fields.score};

	    });
		criteria = new_r;
		
		//console.log('/search criteria = ' + JSON.stringify(new_r));
	
	read_n_print(res,criteria,0);
}); // Search Function

app.get('/update', function(req, res) {
	res.render('updateRestaurantForm', {});
}); // Update Restaurant Form

app.post('/update', function(req, res) {
	console.log('Incoming request: post %s', req.path);
	console.log("pass successful");

	var criteria = {};
	var new_r = {};	// document to be inserted
		var form = new formidable.IncomingForm();
	    form.parse(req, function (err, fields, files) {


	      var filename = files.filetoupload.path;
	      
	      if (files.filetoupload.type) {
	        var mimetype = files.filetoupload.type;
	      }
		  fs.readFile(filename, function(err,data) {
	          new_r.mimetype = mimetype;
	          new_r.image = new Buffer(data).toString('base64');
	      })

	      if (fields.restaurant_id) {new_r.restaruant_id = fields.restaurant_id};
		  if (fields.name) {new_r.name = fields.name};
		  if (fields.borough) {new_r.borough = fields.borough};
		  if (fields.cuisine) {new_r.cuisine = fields.cuisine};
	      if (fields.building) {new_r.building = fields.building};
	      if (fields.coordx) {new_r.coordx = fields.coordx};
	      if (fields.coordy) {new_r.coordy = fields.coordy};
	      if (fields.street) {new_r.street = fields.street};
	      if (fields.zipcode) {new_r.zipcode = fields.zipcode};
	      if (fields.user) {new_r.user = fields.user};
	      if (fields.score) {new_r.score = fields.score};
		  if (fields.owner) {new_r.owner = fields.owner} else {new_r.owner = ""};
	    });
	    new_r._id = displayid;
		criteria = new_r;
		
		//console.log('/search criteria = ' + JSON.stringify(new_r));
	if (updateRestOwner == loginedUser){
		update(res,criteria,req);
		res.redirect('/index');
	} else {
		//res.redirect('/notFound');
		console.log("You are not owner!");
		console.log(updateRestOwner);
		console.log(loginedUser);
		res.redirect('/index');
	}
	
}); // Update Function


app.get('/delete', function(req, res) {
	console.log('Incoming request: post %s', req.path);
	console.log("pass successful");

	var criteria = {};
	var new_r = {};	// document to be inserted

	    new_r._id = displayid;
		criteria = new_r;
		
		//console.log('/search criteria = ' + JSON.stringify(new_r));
	if (new_r['owner'] == loginedUser){
		remove(res,criteria); 
		res.redirect('/index');
	} else {
		//res.redirect('/notFound');
		console.log("You are not owner!");
		remove(res,criteria);
		res.redirect('/index');
	}
	
}); // Delete Function

app.get('/rate', function(req, res) {
	res.render('rateForm', {});
}); // Rate Restaurant Form

app.post('/rate', function(req, res) {
	console.log('Incoming request: post %s', req.path);
	console.log("pass successful");

	var criteria = {};
	var new_r = {};	// document to be inserted
		var form = new formidable.IncomingForm();
	    form.parse(req, function (err, fields, files) {
	      if (fields.score) {new_r.score = fields.score};
		});
	    new_r._id = displayid;
		criteria = new_r;
	
	var rateEx = true;

	for (var i = 0; i < rateuser.length; i++) {

		if (loginedUser == rateuser[i]) {
			console.log("You have already rated");
			rateEx = false;
			break;
		}
	}
	if (rateEx) {
		if (new_r.score < 0 || new_r.score > 10) {
			console.log("Score must between 1 - 10");
		} else {
			rate(res,criteria,req);

	    };
	}
    res.redirect('/index');
/*
	if (new_r.score < 0 || new_r.score > 10) {
		console.log("Score must between 1 - 10");
		res.redirect('/index');
	} else if (req.session.nVisit > 1) { 
		console.log("You have rate before!");
		res.redirect('/index');
	} else {
		rate(res,criteria,req);
    	res.redirect('/index');
    };
*/
}); // Rate Function



function userAccount(res) {
	MongoClient.connect(mongourl, function(err, db) {
		assert.equal(err,null);
		console.log('Connected to MongoDB\n');
		findUser(db,function(user) {
			db.close();
			console.log('Disconnected MongoDB\n');
			users = user;
		}); 
	});
} //Get User account data

function findUser(db,callback) {
	var user = [];
	cursor = db.collection('user').find(); 		
	cursor.each(function(err, doc) {
		assert.equal(err, null); 
		if (doc != null) {
			user.push(doc);
		} else {
			callback(user); 
		}
	});
} //Find user db for Get User

function read_n_print(res,criteria,max) {
	MongoClient.connect(mongourl, function(err, db) {
		assert.equal(err,null);
		console.log('Connected to MongoDB\n');
		findRestaurants(db,criteria,max,function(restaurants) {
			db.close();
			console.log('Disconnected MongoDB\n');
			res.render('index', {r: restaurants});
				//return(restaurants);
		}); 
	});
} //Print index


function findRestaurants(db,criteria,max,callback) {
	var restaurants = [];
	if (max > 0) {
		cursor = db.collection('restaurant').find(criteria).limit(max); 		
	} else {
		cursor = db.collection('restaurant').find(criteria); 				
	}
	cursor.each(function(err, doc) {
		assert.equal(err, null); 
		if (doc != null) {
			restaurants.push(doc);
		} else {
			callback(restaurants); 
		}
	});
} //Find restarurnt for read_n_print


function displayRestaurant(res,id) {
	MongoClient.connect(mongourl, function(err, db) {
		assert.equal(err,null);
		console.log('Connected to MongoDB\n');
		db.collection('restaurant').
			findOne({_id: ObjectId(id)},function(err,doc) {
				assert.equal(err,null);
				db.close();
				console.log('Disconnected from MongoDB\n');
				console.log(doc.name);


				if (doc.grades.length > 0) {
					for (var i = 0; i < doc.grades.length; i++) {
						if (doc.grades[i].user != "" && doc.grades[i].user != null) {
							rateuser.push(doc.grades[i].user);
						}
					}
				}

				updateRestOwner = doc.owner;

				if (doc.image != "" && doc.image != null) {
					res.render('displayDetailsWithPhoto', {r: doc});
				} else {

					res.render('displayDetails', {r: doc});
				}
		});
	});
} //Display Restaruant details


function create(res,queryAsObject,req) {
	var new_r = {};	// document to be inserted
	
	    var form = new formidable.IncomingForm();
	    form.parse(req, function (err, fields, files) {
	      console.log(JSON.stringify(files));
	      if (files.filetoupload.size == 0) {
	        console.log("No file uploaded!");  
	      }
	      var filename = files.filetoupload.path;
	      
	      if (files.filetoupload.type) {
	        var mimetype = files.filetoupload.type;
	      }
	      if (fields.restaurant_id) {new_r.restaruant_id = fields.restaurant_id}
	      	else {new_r.restaruant_id = ""}
		  if (fields.name) {new_r.name = fields.name}
		  	else {new_r.name = ""}
		  if (fields.borough) {new_r.borough = fields.borough}
			else {new_r.borough = ""}
		  if (fields.cuisine) {new_r.cuisine = fields.cuisine}
			else {new_r.cuisine = ""}

	      fs.readFile(filename, function(err,data) {
	          new_r.mimetype = mimetype;
	          new_r.image = new Buffer(data).toString('base64');
	      })

	      	var address = {};
	        if (fields.building) {address.building = fields.building}
	        	else {address.building = ""}
	        if (fields.street) {address.street = fields.street}
	        	else {address.street = ""}
	        if (fields.zipcode) {address.zipcode = fields.zipcode}
	    		else {address.zipcode = ""}
	    	var coord = []
	        if (fields.coordx){coord.push(coordx)} else {coord.push(0)} 

	        if (fields.coordy){coord.push(coordx)} else {coord.push(0)} 
	        address['coord'] = coord; 	
	        new_r['address'] = address;

	      new_r['grades'] = [];

	      
	    }); //get image

	new_r['owner'] = loginedUser;

	console.log('About to insert: ' + JSON.stringify(new_r));

	MongoClient.connect(mongourl,function(err,db) {
		assert.equal(err,null);
		console.log('Connected to MongoDB\n');
		insertRestaurant(db,new_r,function(result) {
			db.close();
			console.log(JSON.stringify(result));
			console.log(JSON.stringify(new_r));
			//res.render('insertDataStatus', {restaruantData: JSON.stringify(new_r)});	
		});
	});
	
} //Create Restaurant

function insertRestaurant(db,r,callback) {
	db.collection('restaurant').insertOne(r,function(err,result) {
		assert.equal(err,null);
		console.log("Insert was successful!");
		callback(result);
	});
} //Function in Create Restaurant

function update(res,queryAsObject,req) {
	console.log('About to update ' + JSON.stringify(queryAsObject));
	MongoClient.connect(mongourl,function(err,db) {
		assert.equal(err,null);
		console.log('Connected to MongoDB\n');
		var criteria = {};
		criteria['_id'] = ObjectId(queryAsObject._id);
		var newValues = {};
		/*
		for (key in queryAsObject) {
			if (key != "_id") {
				newValues[key] = queryAsObject[key];				
			}
		}
		*/
		var address = {};
		for (key in queryAsObject) {
			if (key == "_id") {
				continue;
			}
			switch(key) {
				case 'building':
				case 'street':
				case 'zipcode':
					address[key] = queryAsObject[key];
					break;
				default:
					newValues[key] = queryAsObject[key];	
			}
		}
		if (address.lenght > 0) {
			newValues['address'] = address;
		}
		console.log('Preparing update: ' + JSON.stringify(newValues));
		updateRestaurant(db,criteria,newValues,function(result) {
			db.close();
			console.log("update was successful!");			
		});
	});
} //Update Restaurant

function updateRestaurant(db,criteria,newValues,callback) {
	db.collection('restaurant').updateOne(
		criteria,{$set: newValues},function(err,result) {
			assert.equal(err,null);
			console.log("update was successfully");
			callback(result);
	});
} //Function to Update Restaurant

function remove(res,criteria) {
	console.log('About to delete ' + JSON.stringify(criteria));
	MongoClient.connect(mongourl,function(err,db) {
		assert.equal(err,null);
		console.log('Connected to MongoDB\n');
		deleteRestaurant(db,criteria,function(result) {
			db.close();
			console.log(JSON.stringify(result));
			console.log("delete was successful!");			
		});
	});
} //delete restaurant

function deleteRestaurant(db,criteria,callback) {
	 criteria['_id']=ObjectId(criteria._id);
	db.collection('restaurant').deleteMany(criteria,function(err,result) {
		assert.equal(err,null);
		console.log("Delete was successfully");
		callback(result);
	});
} //Function to Update Restaurant

function rate(res,queryAsObject,req) {
	console.log('About to update ' + JSON.stringify(queryAsObject));
	MongoClient.connect(mongourl,function(err,db) {
		assert.equal(err,null);
		console.log('Connected to MongoDB\n');
		var criteria = {};
		criteria['_id'] = ObjectId(queryAsObject._id);
		var newValues = {};
		/*
		for (key in queryAsObject) {
			if (key != "_id") {
				newValues[key] = queryAsObject[key];				
			}
		}
		*/
		var address = {};
		for (key in queryAsObject) {
			if (key == "_id") {
				continue;
			}
			switch(key) {
				case 'building':
				case 'street':
				case 'zipcode':
					address[key] = queryAsObject[key];
					break;
				default:
					newValues[key] = queryAsObject[key];	
			}
		}
		if (address.lenght > 0) {
			newValues['address'] = address;
		}
		newValues['user'] = loginedUser;

		console.log('Preparing update: ' + JSON.stringify(newValues));
		rateRestaurant(db,criteria,newValues,function(result) {
			db.close();
			console.log("rate was successful!");			
		});
	});
} //Rate Restaurant

function rateRestaurant(db,criteria,newValues,callback) {
	db.collection('restaurant').update(
		criteria,{$push: {grades: newValues}},function(err,result) {
			assert.equal(err,null);
			console.log("Rate was successfully");
			callback(result);
	});
} //Function to Rate Restaurant


app.get('*', function(req,res) {
	res.set({"Content-Type":"text/plain"});
	res.status(404).end("404: " + req.path + " not implemented!");
});

app.listen(process.env.PORT || 8099);

