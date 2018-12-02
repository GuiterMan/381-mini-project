var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
const mongourl = 'mongodb://Samuel:Killer000@ds251362.mlab.com:51362/guiterman';
var assert = require('assert');
var ObjectId = require('mongodb').ObjectId;

router.get('/delete', function (req, res,next) {
    console.log('Incoming request: post %s', req.path);
    console.log("pass successful");

    //console.log('/search criteria = ' + JSON.stringify(new_r));
    console.log(req.session.userid);
    console.log(req.query.owner);
    if (req.session.userid == req.query.owner) {
        remove(res, {_id: req.query._id});
        res.redirect('/');
    } else {
        //res.redirect('/notFound');
        console.log("You are not owner!");
        next();
        res.redirect('/');
    }

}); // Delete Function

//--------------------------------------------------------------------------------------------------------------------------
// Functions

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


module.exports = router;