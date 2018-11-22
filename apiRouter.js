var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var mongourl = 'mongodb://Samuel:Killer000@ds251362.mlab.com:51362/guiterman';


/*
Description: Restful Api function for Creating new restaurant
Method: POST
Params: {JSON} Restaurant object
Return: {JSON} returning status and object id for successful insert
*/
router.post('/restaurant', function (req, res) {
    var insertData = req.body;
    var msg = {};
    MongoClient.connect(mongourl, function (err, db) {
        if (err) throw err;
        console.log('Connected to MongoDB\n');
        console.log(insertData);
        if(insertData.hasOwnProperty("name") && insertData.hasOwnProperty("owner")){
            db.collection('restaurant').insertOne(insertData, function (err, result) {
                if (err) throw err;
                if (result) {
                    msg.status = "ok";
                    msg._id = result.ops[0]._id;
                } else {
                    msg.status = "failed";
                }
                res.writeHead(200, {
                    "Content-Type": "application/json"
                });
                res.end(JSON.stringify(msg));
                db.close();
            });
        }else{
            msg.status = "failed";
            res.writeHead(200, {
                "Content-Type": "application/json"
            });
            res.end(JSON.stringify(msg));
        }
    });
});

/*
Description: Restful Api function for getting Restaurant by Name, borough and cuisine
Method: Get
Params: {String} name,
        {String} borough,
        {String} cuisine
Return: {JSON} Restaurant Array/Object 
*/
router.get('/restaurant/:name/:borough/:cuisine', function (req, res) {
    var criteria = {
        "name": req.params.name,
        "borough": req.params.borough,
        "cuisine": req.params.cuisine
    };
    getRestaurantByNBC(criteria,function(result){
        res.writeHead(200, {
            "Content-Type": "application/json"
        });
        if(result.length!=0){
            res.end(JSON.stringify(result));
        }else{
            res.end(JSON.stringify({}));
        }
    })
});

/*
Description: Sync. function for getting Restaurant by Name, borough and cuisine from mongoDB for get request
*/
function getRestaurantByNBC(criteria,callback){
    MongoClient.connect(mongourl, function (err, db) {
        if (err) throw err;
        console.log('Connected to MongoDB\n');
        var resultArray = [];
        db.collection('restaurant').find(criteria).each(function (err, result){
            if (err) throw err;
            if(result!=null){
                resultArray.push(result);
            }else{
                callback(resultArray);
            }
            db.close();
        });
    });
}


module.exports = router;