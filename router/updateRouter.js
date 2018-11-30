var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const mongourl = 'mongodb://Samuel:Killer000@ds251362.mlab.com:51362/guiterman';
var formidable = require('formidable');
var fs = require('fs');
var assert = require('assert');
//Routing

router.get('/update', function (req, res) {
    if (req.query.owner != req.session.userid) {
        res.render('blankPage', {
            title: "Permission denied",
            msg: "You are not the owner.<a href='/index'>Go Back</a>"
        });
    } else {
        res.render('updateRestaurantForm', {
            _id: req.query._id,
            owner: req.query.owner
        });
    }
}); // Update Restaurant Form

router.post('/update', function (req, res) {

    var new_r = {}; // document to be inserted
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (fields.owner != req.session.userid) {
            res.render('blankPage', {
                title: "Permission denied",
                msg: "You are not the owner.<a href='/index'>Go Back</a>"
            });
        } else {
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
            update({
                _id: ObjectId(fields._id)
            }, new_r, function (result, db) {
                if (result) {
                    db.close();
                    console.log("Insert was successful!");
                    res.redirect("/index");
                }
            });
        }
    });

}); // Update Function

//--------------------------------------------------------------------------------------------------------------------------
// Functions


function update(criteria, new_r, callback) {
    MongoClient.connect(mongourl, function (err, db) {
        assert.equal(err, null);
        console.log('Connected to MongoDB\n');
        db.collection('restaurant').updateOne(criteria, {
            $set: new_r
        }, function (err, result) {
            assert.equal(err, null);
            callback(result, db);
        });
    });
} //Function in Create Restaurant
module.exports = router;