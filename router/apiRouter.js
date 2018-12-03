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
router.post('/restaurant/', function (req, res) {
    var insertData = req.body;
    var msg = {};
    MongoClient.connect(mongourl, function (err, db) {
        if (err) throw err;
        console.log('Connected to MongoDB\n');
        var address = {
            "building": "",
            "street": "",
            "zipcode": "",
            "coord": ["",
                ""
            ]
        };
        var grades = [];       
        insertData.restaurant_id = "";
        insertData.borough = "";
        insertData.cuisine = "";
        insertData.address = address;
        insertData.grades = grades;
        insertData.mimetype = "";
        insertData.image = "";
        
        if (insertData.hasOwnProperty("name") && insertData.hasOwnProperty("owner")) {
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
        } else {
            msg.status = "failed";
            res.writeHead(200, {
                "Content-Type": "application/json"
            });
            res.end(JSON.stringify(msg));
        }
    });
});
/*
Description: Restful Api function for getting Restaurant by Name, borough or cuisine
Method: Get
Params: {String} key (name | borough | cuisine),
        {String} value
Return: {JSON} Restaurant Array/Object 
*/

router.get('/restaurant/read/:key/:value', function (req, res) {
    var key = req.params.key;
    var keys = ["name", "borough", "cuisine"];
    if (!keys.includes(key)) {
        res.writeHead(404, {
            "Content-Type": "application/json"
        });
        res.end(JSON.stringify({
            "Error": "Incorrect key"
        }));
    } else {
        var criteria = {
            [key]: req.params.value
        };
        read(criteria, function (result, db) {
            res.writeHead(200, {
                "Content-Type": "application/json"
            });
            if (result.length != 0) {
                res.end(JSON.stringify(result));
            } else {
                res.end(JSON.stringify({}));
            }
            db.close();
            console.log("DB Close");
        });
    }
});

/*
Description: Sync. function for getting Restaurant by Name, borough and cuisine from mongoDB for get request
*/
function read(criteria, callback) {
    MongoClient.connect(mongourl, function (err, db) {
        if (err) throw err;
        console.log('Connected to MongoDB\n');
        var resultArray = [];
        db.collection('restaurant').find(criteria).each(function (err, result) {
            if (err) throw err;
            if (result != null) {
                resultArray.push(result);
            } else {
                callback(resultArray, db);
            }
        });
    });
}


module.exports = router;