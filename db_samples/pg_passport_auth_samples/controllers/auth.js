var router = require('express').Router();
var passport = require('../config/passport').get();
var async = require('async');
var Email_Token = require('../models/email_token');
var PasswordReset_Token = require('../models/password_change_request');
var Email_Helper = require('../helpers/mailHelper');
var User = require('../models/user');

router.get('/login', function (req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    //console.log("req.flash('loginMessage')", req.flash('loginMessage'));
    res.render('login.ejs', {message: req.flash('loginMessage'), user: null});
});

router.get('/change_password', function (req, res, next) {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    //console.log("req.flash('loginMessage')", req.flash('loginMessage'));
    res.render('change_password.ejs', {message: req.flash('changePasswordMessage'), user: req.user});
});

router.get('/forgot_password', function (req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    //console.log("req.flash('loginMessage')", req.flash('loginMessage'));
    res.render('forgot_password.ejs', {message: req.flash('forgotPasswordMessage'), user: req.user});
});

router.get('/reset_password', function (req, res, next) {
    //console.log(req.flash('resetPasswordMessage'));
    var tokenStr = "";
    if (typeof req.query.token != "undefined" && req.query.token != null) {
        tokenStr = req.query.token;
    }
    res.render('reset_password.ejs', {message: req.flash('resetPasswordMessage'), user: req.user, token: tokenStr});
});

router.get('/signup', function (req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.render('signup.ejs', {message: req.flash('signupMessage'), user: null});
});

router.get('/logout', function (req, res, next) {
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

router.get('/resend_email_verification', function (req, res, next) {
    // Get user obj and check if already verified, if verified send message that already verified
    if (!req.user) {
        return res.render('message', {message: "User not logged in"});
    }
    if (req.user.is_email_verified == true) {
        return res.render('message', {message: "The user " + req.user.username + " is already verified via email"});
    }
    Email_Token.getOrCreate(req.user.id, function (err, tokenObj) {
            if (err) {
                return next(err);
            }
            // Send the email verification email
            var userEmail = req.user.email;
            var userName = req.user.username;
            var fromAddress = 'info@injectsolar.com';
            var subject = 'User Email Verification';
            var html = "Dear " + userName + ", <br> Click the following link to verify your email <br><br> " + "http://localhost:3000/verify_email?token=" + tokenObj.token;
            // Send user verification email to the user
            Email_Helper.sendMailViaGmail(fromAddress, userEmail, subject, html, function (err, response) {
                if (err) {
                    console.error("Error in sending User verification mail", err);
                    return res.render('message', {message: "User Verification mail couldn't be sent, send again later"});
                }
                console.log("Gmail send verification email response is" + JSON.stringify(response));
                return res.render('message', {message: "User Verification mail sent, please check your email"});
            });
        }
    );
});

router.post('/change_password', function (req, res, next) {
    // Check if user is logged in
    if (!req.user) {
        return res.render('message', {message: "User not logged in"});
    }
    // Check if required credentials are present
    var old_password = req.body.old_password;
    var new_password = req.body.new_password;
    var confirm_password = req.body.confirm_password;
    if (typeof old_password == "undefined") {
        return res.render('change_password.ejs', {message: "Invalid old_password field", user: req.user});
    }
    if (typeof new_password == "undefined") {
        return res.render('change_password.ejs', {message: "Invalid new_password field", user: req.user});
    }
    if (typeof confirm_password == "undefined") {
        return res.render('change_password.ejs', {message: "Invalid confirm_password field", user: req.user});
    }
    // check if old password is correct
    if (old_password != req.user.password) {
        return res.render('change_password.ejs', {message: "Incorrect old_password field", user: req.user});
    }
    // check if both new_password and confirm_password match
    if (new_password != confirm_password) {
        return res.render('change_password.ejs', {
            message: "new_password and confirm_password fields do not match",
            user: req.user
        });
    }
    //check if new password is fit
    if (!User.isPasswordFit(new_password)) {
        return res.render('change_password.ejs', {message: "new_password is weak", user: req.user});
    }
    User.updateById(req.user.id, {"password": User.generateHash(new_password.trim())}, function (err, updateRes) {
        if (err) {
            return callback(err);
        }
        return res.render('change_password.ejs', {
            message: "Password changed successfully. Log in next time with new password",
            user: req.user
        });
    });
});

router.post('/forgot_password', function (req, res, next) {
    // Check if required credentials are present
    var email_id = req.body.email_id;
    if (typeof email_id == "undefined") {
        return res.render('forgot_password.ejs', {message: "Invalid email Id input", user: req.user});
    }
    // If email not present in people_details table, say email not registered
    var findEmailIsRegistered = function (callback) {
        User.getByEmail(email_id, function (err, users) {
            if (err) {
                return callback(err);
            }
            if (users.length == 0) {
                return callback(new Error("No user registered with this email id"));
            }
            return callback(null, users[0]);
        });
    };
    // If email registered get the token from password_change_requests table using user_id attribute.
    // If token does not exist, create a new token, if token is expired, delete the old one and create a new one
    var getUserPasswordResetTokenRow = function (userObj, callback) {
        PasswordReset_Token.getOrCreate(userObj.id, function (err, tokenObj) {
            if (err) {
                return callback(err);
            }
            if (tokenObj == null) {
                return callback(new Error("Could not create password reset link please try again"));
            }
            return callback(null, {user: userObj, tokenObj: tokenObj});
        });
    };
    async.waterfall([findEmailIsRegistered, getUserPasswordResetTokenRow], function (err, prevRes) {
        if (err) {
            return res.render("forgot_password", {message: "Error: " + JSON.stringify(err)});
        }
        // Send the password reset link email
        var userEmail = prevRes.user.email;
        var userName = prevRes.user.username;
        var fromAddress = 'info@injectsolar.com';
        var subject = 'Password Reset Link';
        var html = "Dear " + userName + ", <br> Click the following link to reset your accunt password <br><br> " + "http://localhost:3000/reset_password?token=" + prevRes.tokenObj.token;
        Email_Helper.sendMailViaGmail(fromAddress, userEmail, subject, html, function (err, response) {
            if (err) {
                console.error("Error in sending Password Reset Link email", err);
                return res.render('forgot_password', {message: "Password Reset email couldn't be sent, please send again"});
            }
            console.log("Gmail send password reset email response is" + JSON.stringify(response));
            return res.render('message', {message: "Password Reset mail sent, please check your email"});
        });
    });
});

router.post('/reset_password', function (req, res, next) {
    // Check if required credentials are present
    var token = req.body.token;
    if (!(typeof token != "undefined" && token != null && (token + "").trim() != "")) {
        return res.render('message', {
            message: "Invalid password reset token, Please click the link in the email again...",
            user: req.user
        });
    }
    var new_password = req.body.new_password;
    var confirm_password = req.body.confirm_password;
    if (typeof new_password == "undefined") {
        return res.render('message', {message: "Invalid new_password field", user: req.user});
    }
    if (typeof confirm_password == "undefined") {
        return res.render('message', {message: "Invalid confirm_password field", user: req.user});
    }
    // check if both new_password and confirm_password match
    if (new_password != confirm_password) {
        return res.render('message', {
            message: "new_password and confirm_password fields do not match",
            user: req.user
        });
    }
    //check if new password is fit
    if (!User.isPasswordFit(new_password)) {
        return res.render('message', {message: "new_password is weak", user: req.user});
    }
    token = token.trim();
    // get the token obj from token field in password_change_requests table
    var getTokenRow = function (callback) {
        PasswordReset_Token.getByToken(token, function (err, tokens) {
            if (err) {
                return callback(err);
            }
            if (tokens.length == 0) {
                return callback(new Error("No password reset request with this token, please check mail and click the password reset link again."));
            }
            return callback(null, tokens[0]);
        });
    };
    // get the user object from the token obj users_id row
    var getUserObjFromToken = function (tokenObj, callback) {
        var userId = tokenObj.users_id;
        User.get(userId, function (err, users) {
            if (err) {
                return callback(err);
            }
            if (users.length == 0) {
                return callback(new Error("No user associated with this password reset token, please click the Forgot Password link in the website again."));
            }
            return callback(null, users[0]);
        });
    };
    async.waterfall([getTokenRow, getUserObjFromToken], function (err, userObj) {
        if (err) {
            console.log(err);
            return res.render("message", {message: "Error: " + JSON.stringify(err)});
        }
        // Change the User password
        User.updateById(userObj.id, {"password": User.generateHash(new_password.trim())}, function (err, updateRes) {
            if (err) {
                return next(err);
            }
            return res.render('message', {
                message: "Password reset successfully. Log in next time with new password",
                user: req.user
            });
        });
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
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
    //res.json({redirect: '/login'});
}

module.exports = router;