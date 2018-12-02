var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const mongourl = 'mongodb://Samuel:Killer000@ds251362.mlab.com:51362/guiterman';
var assert = require('assert');

router.get('/display', function (req, res,next) {
    displayRestaurant(req.query._id, function (callback, db) {
        if (callback != null) {
            db.close();
            console.log('Disconnected from MongoDB\n');
            res.render('displayDetails', {
                r: callback
            });
        }
    });
}); // displayfurtherdetails


function displayRestaurant(id, callback) {
    MongoClient.connect(mongourl, function (err, db) {
        assert.equal(err, null);
        console.log('Connected to MongoDB\n');
        db.collection('restaurant').
        findOne({
            _id: ObjectId(id)
        }, function (err, doc) {
            assert.equal(err, null);
            callback(doc, db);
        });
    });
} //Display Restaruant details


module.exports = router;