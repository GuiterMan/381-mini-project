var fs = require('fs');
var formidable = require('formidable');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var session = require('cookie-session');
var bodyP = require('body-parser');
var mongourl = 'mongodb://Samuel:Killer000@ds251362.mlab.com:51362/guiterman';
var express = require('express');
var apiRouter = require('./router/apiRouter.js');
var userRouter = require('./router/userRouter.js');
var createRouter = require('./router/createRouter.js');
var updateRouter = require('./router/updateRouter.js');
var displayRouter = require('./router/displayRouter.js');
var rateRouter = require('./router/rateRouter.js');


var app = express();

app.use(bodyP.json());
app.use(bodyP.urlencoded({
	extended: true
}));
app.use(express.static('public'));

app.set('view engine', 'ejs');

var loginedUser;
var displayid = "";

app.use(session({
	name: 'session',
	keys: ["4kegzpAsIg4jSMgC8DLVyQqq9uKzmiKl", "ARX8cLM0dxhHJi2nbnfONollLDSUHsGX"]
}));

app.use('/api', apiRouter);
app.use(userRouter);

app.use('/',function(req,res,next){
	if(req.session.userid==null){
		res.redirect('/login');
	}else{
		next();
	}
});

app.use(createRouter);
app.use(updateRouter);
app.use(displayRouter);
app.use(rateRouter);

app.get('/', function (req, res) {
	res.redirect('/index');
}); // index

app.get('/index', function (req, res) {
	console.log("Login user: "+req.session.userid);
	read_n_print(res, {}, 10);

}); // index


app.get('/search', function (req, res) {
	res.render('searchForm', {});
}); // Search Restaurant Form

app.post('/search', function (req, res) {
	console.log('Incoming request: post %s', req.path);
	console.log("pass successful");

	var criteria = {};
	var new_r = {}; // document to be inserted
	var form = new formidable.IncomingForm();
	form.parse(req, function (err, fields, files) {

		if (fields.restaurant_id) {
			new_r.restaruant_id = fields.restaurant_id;
		}
		if (fields.name) {
			new_r.name = fields.name;
		}
		if (fields.borough) {
			new_r.borough = fields.borough;
		}
		if (fields.cuisine) {
			new_r.cuisine = fields.cuisine;
		}
		if (fields.building) {
			new_r.building = fields.building;
		}
		if (fields.coordx) {
			new_r.coordx = fields.coordx;
		}
		if (fields.coordy) {
			new_r.coordy = fields.coordy;
		}
		if (fields.street) {
			new_r.street = fields.street;
		}
		if (fields.zipcode) {
			new_r.zipcode = fields.zipcode;
		}
		if (fields.user) {
			new_r.user = fields.user;
		}
		if (fields.score) {
			new_r.score = fields.score;
		}

	});
	criteria = new_r;

	//console.log('/search criteria = ' + JSON.stringify(new_r));

	read_n_print(res, criteria, 0);
}); // Search Function


app.get('/delete', function (req, res) {
	console.log('Incoming request: post %s', req.path);
	console.log("pass successful");

	var criteria = {};
	var new_r = {}; // document to be inserted

	new_r._id = displayid;
	criteria = new_r;

	//console.log('/search criteria = ' + JSON.stringify(new_r));
	if (new_r['owner'] == loginedUser) {
		remove(res, criteria);
		res.redirect('/index');
	} else {
		//res.redirect('/notFound');
		console.log("You are not owner!");
		remove(res, criteria);
		res.redirect('/index');
	}

}); // Delete Function


function read_n_print(res, criteria, max) {
	MongoClient.connect(mongourl, function (err, db) {
		assert.equal(err, null);
		console.log('Connected to MongoDB\n');
		findRestaurants(db, criteria, max, function (restaurants) {
			db.close();
			console.log('Disconnected MongoDB\n');
			res.render('index', {
				r: restaurants
			});
			//return(restaurants);
		});
	});
} //Print index


function findRestaurants(db, criteria, max, callback) {
	var restaurants = [];
	if (max > 0) {
		cursor = db.collection('restaurant').find(criteria).limit(max);
	} else {
		cursor = db.collection('restaurant').find(criteria);
	}
	cursor.each(function (err, doc) {
		assert.equal(err, null);
		if (doc != null) {
			restaurants.push(doc);
		} else {
			callback(restaurants);
		}
	});
} //Find restarurnt for read_n_print

function remove(res, criteria) {
	console.log('About to delete ' + JSON.stringify(criteria));
	MongoClient.connect(mongourl, function (err, db) {
		assert.equal(err, null);
		console.log('Connected to MongoDB\n');
		deleteRestaurant(db, criteria, function (result) {
			db.close();
			console.log(JSON.stringify(result));
			console.log("delete was successful!");
		});
	});
} //delete restaurant

function deleteRestaurant(db, criteria, callback) {
	criteria['_id'] = ObjectId(criteria._id);
	db.collection('restaurant').deleteMany(criteria, function (err, result) {
		assert.equal(err, null);
		console.log("Delete was successfully");
		callback(result);
	});
} //Function to Update Restaurant

app.get('*', function (req, res) {
	res.set({
		"Content-Type": "text/plain"
	});
	res.status(404).end("404: " + req.path + " not implemented!");
});

app.listen(process.env.PORT || 8099);