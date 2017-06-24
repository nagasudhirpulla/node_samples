var squel = require('squel').useFlavour('postgres');
var pool = require('../config/db');
var crypto = require('crypto');
var User = require('./user');
var async = require('async');
var tableName = "people_details.users_verification";
var tableColumns = ["id", "users_id", "token", "expires_at", "created_at", "updated_at"];

module.exports.create = function (user_id, done) {
    var token = "";
    // Generate a token
    crypto.randomBytes(20, function (err, buf) {
        if (err) return done(err);
        var token = buf.toString('hex');
        // Token is obtained

        // Insert the info into the users_verification table
        var insert_sql = squel.insert()
            .into(tableName)
            .set('users_id', user_id)
            .set('token', token)
            .onConflict("users_id")
            .returning('*')
            .toParam();
        //console.log("email token insert sql", insert_sql);
        pool.query(insert_sql.text, insert_sql.values, function (err, res) {
            if (err) {
                console.error('error running email_token INSERT query', err);
                return done(err);
            }
            //console.log('SELECT result ======>', res);
            if (res.rows.length == 0) {
                return done(null, null);
            }
            var row = null;
            if (res.rows.length != 0) {
                row = res.rows[0];
            }
            return done(null, row);
        });
    });
};

module.exports.getByToken = function (token, done) {
    var select_sql =
        squel.select()
            .from(tableName)
            .where("token = ?", token)
            .toParam();
    //console.log("email token select sql", select_sql);
    pool.query(select_sql.text, select_sql.values, function (err, res) {
        if (err) {
            console.error('error running email_token SELECT by token query', err);
            return done(err);
        }
        //console.log('SELECT result ======>', res);
        done(null, res.rows);
    });
};

module.exports.getByUserId = function (user_id, done) {
    var select_sql =
        squel.select()
            .from(tableName)
            .where("users_id = ?", user_id)
            .toParam();
    //console.log("email token select sql", select_sql);
    pool.query(select_sql.text, select_sql.values, function (err, res) {
        if (err) {
            console.error('error running email_token SELECT by users_id query', err);
            return done(err);
        }
        //console.log('SELECT result ======>', res);
        done(null, res.rows);
    });
};

module.exports.getOrCreate = function (user_id, done) {
    var getTokenObj = function (callback) {
        var prevRes = {token: null};
        module.exports.getByUserId(user_id, function (err, tokens) {
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
    var createToken = function (prevRes, callback) {
        if (prevRes.token != null) {
            return callback(null, prevRes);
        }
        module.exports.create(user_id, function (err, tokenObj) {
            if (err) {
                return callback(err);
            } else {
                return callback(null, {token: tokenObj});
            }
        });
    };
    async.waterfall([getTokenObj, createToken], function (err, result) {
        if (err) {
            return done(err);
        } else {
            return done(null, result.token);
        }
    });
};