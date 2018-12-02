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
var searchRouter = require('./router/searchRouter.js');
var deleteRouter = require('./router/deleteRouter.js');



var app = express();

app.use(bodyP.json());
app.use(bodyP.urlencoded({
	extended: true
}));
app.use(express.static('public'));

app.set('view engine', 'ejs');


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
app.use(searchRouter);
app.use(deleteRouter);

app.get('/', function (req, res) {
	res.redirect('/index');
}); // index

app.get('/index', function (req, res) {
	console.log("Login user: "+req.session.userid);
	read_n_print(res, {}, 10);

}); // index

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



app.get('*', function (req, res) {
	res.set({
		"Content-Type": "text/plain"
	});
	res.status(404).end("404: " + req.path + " not implemented!");
});

app.listen(process.env.PORT || 3000);