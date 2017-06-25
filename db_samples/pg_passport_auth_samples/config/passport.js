var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var passport = require('passport');
var Email_Token = require('../models/email_token');
var Email_Helper = require('../helpers/mailHelper');

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.get(id, function (err, users) {
        done(err, users[0]);
    });
});

passport.use('local-signup', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    },
    function (req, username, password, done) {
        process.nextTick(function () {
            var userEmail = req.param('email_id');
            User.getByUsernameOrEmail(username, userEmail, function (err, users) {
                if (err) {
                    //return done(err);
                    return done(null, false, req.flash('signupMessage', JSON.stringify(err)));
                }
                if (users[0]) {
                    return done(null, false, req.flash('signupMessage', 'The username/email is already taken'));
                } else {
                    if (req.param('password') != req.param('confirm_password')) {
                        return done(null, false, req.flash('signupMessage', "password and confirm password fields did not match"));
                    }
                    if (!User.isPasswordFit(password)) {
                        return done(null, false, req.flash('signupMessage', "password is weak"));
                    }
                    // Create a new User
                    User.create(username, User.generateHash(password), userEmail, function (err, userId) {
                        if (err) {
                            //return done(err);
                            return done(null, false, req.flash('signupMessage', JSON.stringify(err)));
                        }
                        // Create the verification token table entry
                        Email_Token.create(userId, function (err, tokenObj) {
                            if (err) {
                                //return done(err);
                                return done(null, false, req.flash('signupMessage', JSON.stringify(err)));
                            }
                            //Use token id to get the user id and using user id get the user email address
                            var token = tokenObj.token;
                            var user_id = tokenObj.users_id;
                            // get the user by his token table users_id
                            User.get(user_id, function (err, users) {
                                if (err) {
                                    return done(err);
                                }
                                //user id obtained
                                var userEmail = users[0].email;
                                var userName = users[0].username;
                                var fromAddress = 'info@injectsolar.com';
                                var subject = 'User Email Verification';
                                var html = "Dear " + userName + ", <br> Click the following link to verify your email <br><br> " + "http://localhost:3000/verify_email?token=" + token;
                                // Send user verification email to the user
                                Email_Helper.sendMailViaGmail(fromAddress, userEmail, subject, html, function (err, response) {
                                    if (err) {
                                        console.error("Error in sending User verification mail", err);
                                        return done(null, users[0], req.flash('signupMessage', "User Verification mail couldn't be sent, send again later"));
                                    }
                                    console.log("Gmail send verification email response is" + JSON.stringify(response));
                                    return done(null, users[0], req.flash('signupMessage', "User Verification mail sent, please check your email"));
                                });
                            });
                        });
                    });
                }
            });
        });
    }));

passport.use('local-login', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    },
    function (req, username_email, password, done) {
        process.nextTick(function () {
            //console.log("calling from passport");
            User.getByUsernameOrEmail(username_email, username_email, function (err, users) {
                if (err) {
                    //console.log("Error from passport", err);
                    return done(err);
                }
                if (!users[0]) {
                    //console.log("No User Found from passport");
                    return done(null, false, req.flash('loginMessage', 'No User found'));
                } else {
                    if (!User.validPassword(password, users[0]["password"])) {
                        //console.log("Invalid password from passport");
                        return done(null, false, req.flash('loginMessage', 'invalid password'));
                    }
                    return done(null, users[0]);
                }
            });
        });
    }
));

module.exports.get = function () {
    return passport;
};