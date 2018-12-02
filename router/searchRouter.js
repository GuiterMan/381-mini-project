var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
const mongourl = 'mongodb://Samuel:Killer000@ds251362.mlab.com:51362/guiterman';
var formidable = require('formidable');
var assert = require('assert');
var ObjectId = require('mongodb').ObjectId;

router.get('/search', function (req, res) {
    res.render('searchForm', {});
}); // Search Restaurant Form

router.post('/search', function (req, res) {
    console.log('Incoming request: post %s', req.path);
    console.log("pass successful");

    var criteria = {};
    var new_r = {}; // document to be inserted
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {

        if (fields.restaurant_id) {
            new_r.restaurant_id = fields.restaurant_id;
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

        var address = {};

        if (fields.building) {
            address.building = fields.building;
        }
       
        if (fields.street) {
            address.street = fields.street;
        }
        if (fields.zipcode) {
            address.zipcode = fields.zipcode;
        }

        if (fields.coordx && fields.coordy) {
            var coordxy = [];
            coordxy.push(fields.coordx);
            coordxy.push(fields.coordy);
            console.log(coordxy);
            address.coord = coordxy;
        }

        for(var key in address) {
            if (address.hasOwnProperty(key))
             new_r.address = address;
             break;   
        }

        criteria = new_r;

        console.log('/search criteria = ' + JSON.stringify(criteria));

        read_n_print(res, criteria, 0);
    });
    


}); // Search Function

//--------------------------------------------------------------------------------------------------------------------------
// Functions

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



module.exports = router;