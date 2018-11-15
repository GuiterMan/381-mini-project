var express = require('express');
var app = express();
var mongoose = require('mongoose');
var mongodburl = 'mongodb://381:381@ds032319.mlab.com:32319/comps381f';
var restSchema = require('./models/restaurant');
var bodyParser = require('body-parser');

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(express.static(__dirname+'/public'));

app.get('/',function(req,res){
	res.sendFile(__dirname + '/public/index.html');
});

app.get('/create',function(req,res){
	res.sendFile(__dirname + '/views/create.html');
});

app.post('/createRestaurant',function(req,res){
	//var enoughData = true;
	var restID = 0;
	var data = {address:
{
		street:"",
		zipcode:"",
		building:"",	
	}
	,
	borough:"",
	cuisine:"",
	name:"",
};
	data.address.street= req.body.street;
	data.address.zipcode= req.body.zipcode;
	data.address.building= req.body.building;
	data.borough= req.body.borough;
	data.cuisine= req.body.cuisine;
	data.name= req.body.name;
	if(false){

	}else{


	mongoose.connect(mongodburl);
	
	var db = mongoose.connection;
	db.on('error',console.error.bind(console,'connection 	error:'));
	db.once('open',function(callback,restID){
		var Restaurant = mongoose.model('restaurant',restSchema);
		var r = new Restaurant(data);
			r.save(function(err,restID){
				res.write('<html><body>');
				if(err){
					res.write('<p>'+err.message+'</p>');
				}else{
					res.write('<h1>Create Succeed</h1>');
					console.log('Created:',r._id);
				}
			res.write('<br />'+restID+'<br /><a href="/">Go Home</a></		body></html>');
			res.end();
			db.close();
			});
	});
}
});



app.get('/show', function(req,res) {
	res.sendFile(__dirname + '/views/searchRest.html');  // serve static files
});

app.get('/searchRest',function(req,res) {
	
	mongoose.connect(mongodburl);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var Rest = mongoose.model('restaurant', restSchema);
		var criteria = {address:
{
		street:"",
		zipcode:"",
		building:"",	
	}
	,
	borough:"",
	cuisine:"",
	name:"",
};
		if (req.query.name) {criteria.name = req.query.name;}
		if (req.query.street)  {criteria.address.street = req.query.street;}
		if (req.query.zipcode) {criteria.address.zipcode = req.query.zipcode;}
		if (req.query.building) {criteria.address.building = req.query.building;}
		if (req.query.borough) {criteria.borough = req.query.borough;}
		if (req.query.cuisine) {criteria.cuisine = req.query.cuisine;}
		Rest.find(criteria, function(err,results) {
			if (err) {
				console.log("Error: " + err.message);
				res.write(err.message);
			}
			else {
				console.log('Found: ',results.length);
				res.render('showRest',{rests: results});
			}
			res.end();
			db.close();
		});
	});
});

app.get('/showAll',function(req,res){
	mongoose.connect(mongodburl);
	var db = mongoose.connection;
	db.on('error',console.error.bind(console,'connection error:'));
	db.once('open',function(callback){
		var Rest = mongoose.model('restaurant',restSchema);
		Rest.find(function(err,results){
				if(err){
					console.log("Error: "+err.message);
					res.write(err.message);
				}else{
					console.log('Found',results.length);

					res.render('dataList',{rests:results});
				}
				res.end();
				db.close();
			});
	});	
});

app.get('/delete',function(req,res){
	mongoose.connect(mongodburl);
	var db = mongoose.connection;
	db.on('error',console.error.bind(console,'connection error:'));
	db.once('open',function(callback){
		var Rest = mongoose.model('restaurant',restSchema);
		Rest.find(function(err,results){
				if(err){
					console.log("Error: "+err.message);
					res.write(err.message);
				}else{
					console.log('Found',results.length);
					res.render('showAllData',{rests:results});
				}
				res.end();
				db.close();
			});
	});	
});



app.get('/deleteAllData',function(req,res){
	mongoose.connect(mongodburl);
	
	var db = mongoose.connection;
	db.on('error',console.error.bind(console,'connection error:'));
	console.log("i am here");	
	
	db.once('open',function(callback){
		var Rest = mongoose.model('restaurant',restSchema);
		console.log("step 1~~~~");	
		Rest.remove(function(err){
			if(!err){
					console.log("removed");
					res.write('<html><body>');
					res.write('<h1>Removed</h1>');
					res.write('<br /><a href="/delete">Go back</a></body></html>');
					res.end();
				}else{
					console.log(err);
				}db.close();
		
		});
		
	});
});

app.get('/deleteData/:id',function(req,res){
		mongoose.connect(mongodburl);
		console.log("ID: "+req.params.id);
	
		var db = mongoose.connection;
		db.on('error',console.error.bind(console,'connection error:'));

		db.once('open',function(callback){
			var Rest = mongoose.model('restaurant',restSchema);
			Rest.findOne({_id:req.params.id},function(err,result){
				if(err){
					console.log(err);
				}else{
					result.remove(function(err){
						if(err) console.log(err);
						else{
							console.log("removed");
						res.write('<html><body>');
						res.write('<h1>Removed</h1>');
						res.write('<br /><a href="/delete">Go back</a></body></html>');
						res.end();
						}db.close();
					});
				}
			});
						
		});
});



app.get('/update', function(req,res) {

	mongoose.connect(mongodburl);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var Rest = mongoose.model('restaurant', restSchema);
		var criteria = {};
		Rest.find(function(err,results) {
			if (err) {
				console.log("Error: " + err.message);
				res.write(err.message);
			}
			else {
				console.log('Found: ',results.length);
				res.render('updateList',{rests: results});
			}
			res.end();
			db.close();
		});
	});
});


app.get('/updateRest',function(req,res) {
	res.redirect('/updateRest/name/'+req.query.name);
});

app.get('/updateRest/name/:name', function(req,res) {
	var getname = req.params.name;
	res.render('updateRest',{gotname: getname});
});

app.get('/updated',function(req,res) {
	res.redirect('/updated/'+req.query.name+'/'+req.query.street+'/'+req.query.zipcode+'/'+req.query.building+'/'+req.query.borough+'/'+req.query.cuisine);
});

app.get('/updated/:name/:street/:zipcode/:building/:borough/:cuisine', function(req,res) {
		console.log("street:" +req.params.street);
	
	mongoose.connect(mongodburl);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {	
		var Rest = mongoose.model('restaurant', restSchema);		
		var data = {address:
{
		street:"",
		zipcode:"",
		building:"",	
	}
	,
	borough:"",
	cuisine:"",
	name:"",
	restaurant_id:0
};	
		
		if (req.params.name) {data.name = req.params.name}
		if (req.params.street)  {data.address.street = req.params.street}
		if (req.params.zipcode)  {data.address.zipcode = req.params.zipcode}
		if (req.params.building)  {data.address.building = req.params.building}
		if (req.params.borough)  {data.borough = req.params.borough}
		if (req.params.cuisine)  {data.cuisine = req.params.cuisine}
		Rest.update({name:req.params.name},
		   {$set:data}, function(err,results) {
			res.write('<html><body>');
			if (err) {
				res.write('<p>'+err.message+'</p>');
			}
			else {
				res.write('<h1>Update Succeed</h1>');
				console.log('Updated');
			}
			res.write('<br><a href="/">Go Home</a></body></html>');
			res.end();
			db.close();
		});
	});

});


	
app.listen(process.env.PORT||8099);
