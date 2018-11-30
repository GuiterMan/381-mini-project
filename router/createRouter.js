var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
const mongourl = 'mongodb://Samuel:Killer000@ds251362.mlab.com:51362/guiterman';
var formidable = require('formidable');
var fs = require('fs');
var assert = require('assert');
//Routing

router.get('/create', function (req, res) {
    res.render('createRestaurantForm', {});
});

router.post('/create', function (req, res) {
    var new_r = {}; // document to be inserted
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        address = {
            "building": fields.building,
            "street": fields.street,
            "zipcode": fields.zipcode,
            "coord": [fields.coordx,
                fields.coordy
            ]
        };
        grades = [{
            "user": fields.user,
            "score": fields.score
        }];
        new_r.restaurant_id = fields.restaurant_id;
        new_r.name = fields.name;
        new_r.address = address;
        new_r.borough = fields.borough;
        new_r.cuisine = fields.cuisine;
        new_r.grades = grades;
        new_r.owner = req.session.userid;
        if (files.filetoupload.size == 0) {
            console.log("No file uploaded!");
        }
        var filename = files.filetoupload.path;
        if (files.filetoupload.type) {
            var mimetype = files.filetoupload.type;
        }
        fs.readFile(filename, function (err, data) {
            new_r.mimetype = mimetype;
            new_r.image = new Buffer(data).toString('base64');
        });
        insertRestaurant(new_r, function (result, db) {
            if (result) {
                db.close();
                console.log("Insert was successful!");
                res.redirect("/index");
            }
        });
    }); //get image

});

//--------------------------------------------------------------------------------------------------------------------------
// Functions
function insertRestaurant(new_r, callback) {
    MongoClient.connect(mongourl, function (err, db) {
        assert.equal(err, null);
        console.log('Connected to MongoDB\n');
        db.collection('restaurant').insertOne(new_r, function (err, result) {
            assert.equal(err, null);
            callback(result, db);
        });
    });
} //Function in Create Restaurant


module.exports = router;