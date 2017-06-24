var router = require('express').Router();
var passport = require('../config/passport').get();
var async = require('async');
var Email_Token = require('../models/email_token');
var User = require('../models/user');

router.get('/login', function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    //console.log("req.flash('loginMessage')", req.flash('loginMessage'));
    res.render('login.ejs', {message: req.flash('loginMessage')});
});

router.get('/signup', function (req, res) {
    res.render('signup.ejs', {message: req.flash('signupMessage')});
});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/login');
});

router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

router.post('/signup', function (req, res, next) {
    passport.authenticate('local-signup', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/signup');
        }
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            return res.redirect('/');
        });
    })(req, res, next);
});

router.get('/verify_email', function (req, res, next) {
    var token = req.query.token;
    // check for valid token
    if (typeof token == "undefined" || token == null) {
        return next(new Error("Invalid token input"));
    }
    // get the tokenObj by token
    var getTokenObj = function (callback) {
        var prevRes = {token: null};
        Email_Token.getByToken(token, function (err, tokens) {
                if (err) {
                    return callback(err);
                } else if (tokens.length == 0) {
                    return callback(null, prevRes);
                } else {
                    return callback(null, {token: tokens[0]});
                }
            }
        );
    };
    // get the user id using token Obj
    // set the user is_email_verified field as true
    // If res.rowCount == 0 then display a page showing email already verified
    // If res.rowCount > 0 then display a page showing email verified success message
    var updateUser = function (prevRes, callback) {
        if (prevRes.token == null) {
            return callback(new Error("Invalid email verification token"));
        }
        if (prevRes["token"]["users_id"] == null) {
            return callback(new Error("No user associated with this token"));
        }
        //stub
        User.updateById(prevRes["token"]["users_id"], {"is_email_verified": "true"}, function (err, updateRes) {
            if (err) {
                return callback(err);
            }
            return callback(null, {token: prevRes[token], rowCount: updateRes.rowCount});
        })
    };
    async.waterfall([getTokenObj, updateUser], function (err, result) {
        if (err) {
            return next(err);
        }
        if (result.rowCount == 0) {
            return res.render('message', {message: "Looks like the email is already verified"});
        } else if (result.rowCount > 0) {
            return res.render('message', {message: "Email successfully verified!"});
        }
        return res.render('message', {message: "Email not verified"});
    });
});

router.post('/*', isLoggedIn, function (req, res, next) {
    //console.log('caught a post request');
    next();
});

router.put('/*', isLoggedIn, function (req, res, next) {
    //console.log('caught a put request');
    next();
});

function isLoggedIn(req, res, next) {
    //console.log("reached isLoggedIn...");
    if (req.url === '/forgot' || req.url == "/resetpassword") return next();
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
    //res.json({redirect: '/login'});
}

module.exports = router;