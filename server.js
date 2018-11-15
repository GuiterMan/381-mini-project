var http = require('http');
var url  = require('url');
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
	var id = req.query._id;
	console.log("Finding id:" + id);
	displayRestaurant(res,id)
	
	
}); // displayfurtherdetails

app.get('/create', function(req, res) {
	
	console.log('Incoming request: %s', req.path);
	res.render('createRestaurantForm', {});
	if (req.query.restaurant_id != "" && req.query.restaurant_id != null) {
	
		console.log("Data Recived");
		create(res,req.query);
	}
	
}); // Create Restaurant Form

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
				res.render('displayDetails', {r: doc});
		});
	});
} //Display Restaruant details


function create(res,queryAsObject) {
	var new_r = {};	// document to be inserted
	if (queryAsObject.restaruant_id != "") new_r['restaurant_id'] = queryAsObject.restaurant_id;
	if (queryAsObject.name != "") new_r['name'] = queryAsObject.name;
	if (queryAsObject.borough != "") new_r['borough'] = queryAsObject.borough;
	if (queryAsObject.cuisine != "") new_r['cuisine'] = queryAsObject.cuisine;
	if (queryAsObject.building  != ""|| queryAsObject.street != "") {
		var address = {};
		if (queryAsObject.building != "") address['building'] = queryAsObject.building;
		if (queryAsObject.street != "") address['street'] = queryAsObject.street;
		new_r['address'] = address;
	}
	new_r['owner'] = loginedUser;
	console.log("Owner:" + loginedUser);
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

app.get('*', function(req,res) {
	res.set({"Content-Type":"text/plain"});
	res.status(404).end("404: " + req.path + " not implemented!");
});

app.listen(process.env.PORT || 8099);
