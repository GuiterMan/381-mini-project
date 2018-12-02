var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const mongourl = 'mongodb://Samuel:Killer000@ds251362.mlab.com:51362/guiterman';
var formidable = require('formidable');
var fs = require('fs');
var assert = require('assert');

router.get('/rate', function (req, res) {
    res.render('rateForm', {
        _id: req.query._id
    });
}); // Rate Restaurant Form

router.post('/rate', function (req, res) {
    var criteria = {
        _id: req.body._id,
        user: req.session.userid
    };
    var grade = {
        user: req.session.userid,
        score: req.body.score
    };
    if (req.body.score > 0 && req.body.score <= 10) {
        rate(criteria, grade, function (result, db) {
            db.close();
            console.log('Disconnected from MongoDB\n');
            if (result.resultCodeByBen == 1) {
                console.log("rated");
                res.redirect("/");
            } else {
                title = "Rate failed.";
                msg = "You have already rated this restaurant <br><a href='/index'>Go back</a>";
                res.render('blankPage', {
                    title: title,
                    msg: msg
                });
            }
        });
    } else {
        title = "Rate failed.";
        msg = "Score must between 1 and 10 <br><a href='/index'>Go back</a>";
        res.render('blankPage', {
            title: title,
            msg: msg
        });
    }
}); // Rate Function

//--------------------------------------------------------------------------------------------------------------------------
// Functions

function rate(criteria, grade, callback) {
    findOneRestuarant(criteria._id, function (result, db) {
        var ratedUser = result.grades;
        var rated = false;
        ratedUser.forEach(function (element) {
            if (element.user == criteria.user) {
                rated = true;
            }
        });
        if (!rated) {
            db.collection('restaurant').update({
                _id: ObjectId(criteria._id)
            }, {
                $push: {
                    grades: grade
                }
            }, function (err, result) {
                assert.equal(err, null);
                result.resultCodeByBen = 1;
                callback(result, db);
            });
        } else {
            result.resultCodeByBen = 0;
            callback(result, db);
        }
    });
}

function findOneRestuarant(criteria, callback) {
    MongoClient.connect(mongourl, function (err, db) {
        if (err) throw err;
        console.log('Connected to MongoDB\n');
        // console.log(ObjectId(criteria));
        db.collection('restaurant').findOne({
            _id: ObjectId(criteria)
        }, {
            grades: ""
        }, (function (err, result) {
            if (err) throw err;
            callback(result, db);
        }));
    });
}

module.exports = router;