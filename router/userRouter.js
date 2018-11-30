var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
const mongourl = 'mongodb://Samuel:Killer000@ds251362.mlab.com:51362/guiterman';



router.get('/login', function (req, res) {
    if(req.session.userid==null){
        res.render('loginForm', {});
    }else{
        res.redirect('/index');
    }
});

router.post('/login', function (req, res) {
    findOneUser({
        userid: req.body.userid,
        password: req.body.password
    }, function (result, db) {
        if (result) {
            req.session.userid = result.userid;
            res.redirect('/index');
        } else {
            res.end("No Such User.");
        }
        db.close();
        console.log('Disconnected MongoDB\n');
    });
}); // login

router.get('/register', function (req, res) {
    if(req.session.userid==null){
        res.render('register');
    }else{
        res.redirect('/index');
    }
});

router.post('/register', function (req, res) {
    var insertData = req.body;
    if (insertData.hasOwnProperty("userid") && insertData.hasOwnProperty("password")) {
        register(insertData, function (result, db) {
            if (result.resultCodeByBen == 1) {
                title = "Register Success.";
                msg = "<a href='/login'>Go to Login</a>";
            } else if (result.resultCodeByBen == 0) {
                title = "Register failed.";
                msg = "Userid used. Please register again with diff id.<br><a href='/register'>Go back</a>";
            } else {
                title = "Register failed.";
                msg = "<a href='/register'>Go back</a>";
            }
            res.render('blankPage', {
                title: title,
                msg: msg
            });
            db.close();
            console.log('Disconnected MongoDB\n');
        });
    } else {
        title = "Register failed.";
        msg = "Please input your info. <br><a href='/register'>Go back</a>";
        res.render('blankPage', {
            title: title,
            msg: msg
        });
    }

}); // register


router.get('/logout', function (req, res) {
    req.session = null;
    res.redirect('/login');
}); // logout

//--------------------------------------------------------------------------------------------------------------------------


function findOneUser(criteria, callback) {
    MongoClient.connect(mongourl, function (err, db) {
        if (err) throw err;
        console.log('Connected to MongoDB\n');
        db.collection('user').findOne(criteria, (function (err, result) {
            if (err) throw err;
            callback(result, db);
        }));
    });
}


function register(insertData, callback) {
    var check = insertData.userid;
    findOneUser({
        userid: check
    }, function (result, db) {
        if (result) {
            result.resultCodeByBen = 0;
            callback(result, db);
        } else {
            db.collection('user').insertOne(insertData, (function (err, result) {
                if (err) throw err;
                result.resultCodeByBen = 1;
                callback(result, db);
            }));
        }
    });
}


module.exports = router;