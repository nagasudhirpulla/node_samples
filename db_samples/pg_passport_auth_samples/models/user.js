var squel = require('squel').useFlavour('postgres');
var pool = require('../config/db');
//var bcrypt = require("bcrypt");
var tableName = "people_details.people_details";

module.exports.create = function (usernameIn, passwordIn, emailIn, done) {
    var username = usernameIn.trim();
    var password = passwordIn.trim();
    var email = emailIn.trim();
    var insert_sql =
        squel.insert()
            .into(tableName)
            .set('username', username)
            .set('email', email)
            .set('password', password)
            .returning("*")
            .toParam();
    pool.query(insert_sql.text, insert_sql.values, function (err, res) {
        if (err) {
            console.error('error running user INSERT query', err);
            return done(err);
        }
        //console.log('SELECT result ======>', res);
        if (res.rows.length == 0) {
            return done(null, null);
        }
        return done(null, res.rows[0]['id']);
    });
};

module.exports.get = function (id, done) {
    var select_sql =
        squel.select()
            .from(tableName)
            .where("id = ?", id)
            .toParam();
    pool.query(select_sql.text, select_sql.values, function (err, res) {
        if (err) {
            console.error('error running user SELECT query', err);
            return done(err);
        }
        //console.log('SELECT result ======>', res);
        done(null, res.rows);
    });
};

module.exports.getByUsername = function (username, done) {
    var select_sql =
        squel.select()
            .from(tableName)
            .where("username = ?", username)
            .toParam();
    pool.query(select_sql.text, select_sql.values, function (err, res) {
        if (err) {
            console.error('error running user SELECT by username query', err);
            return done(err);
        }
        //console.log('SELECT result ======>', res);
        done(null, res.rows);
    });
};

module.exports.getByEmail = function (email, done) {
    var select_sql =
        squel.select()
            .from(tableName)
            .where("email = ?", email)
            .toParam();
    pool.query(select_sql.text, select_sql.values, function (err, res) {
        if (err) {
            console.error('error running user SELECT by email query', err);
            return done(err);
        }
        //console.log('SELECT result ======>', res);
        done(null, res.rows);
    });
};

module.exports.getByUsernameOrEmail = function (userNamesArray, emailsArray, done) {
    var uNames = userNamesArray;
    var emails = emailsArray;
    if (uNames.constructor != Array) {
        uNames = [uNames];
    }
    if (emails.constructor != Array) {
        emails = [emails];
    }
    var select_sql =
        squel.select()
            .from(tableName)
            .where("username IN ? OR email IN ?", uNames, emails)
            .toParam();
    pool.query(select_sql.text, select_sql.values, function (err, res) {
        if (err) {
            console.error('error running user SELECT by email or username query', err);
            return done(err);
        }
        //console.log('SELECT result ======>', res);
        done(null, res.rows);
    });
};

module.exports.updateById = function (userId, updateObject, done) {
    var update_sql =
        squel.update()
            .table(tableName)
            .setFields(updateObject)
            .where("id = ?", userId)
            .returning("*")
            .toParam();
    pool.query(update_sql.text, update_sql.values, function (err, res) {
        if (err) {
            console.error('error running user update by id query', err);
            return done(err);
        }
        //console.log('UPDATE user by id result ======>', res);
        done(null, res);
    });
};

module.exports.isPasswordFit = function (str) {
    if (str.trim() == "") {
        return false;
    }
    return true;
};

module.exports.generateHash = function (password) {
    //return bcrypt.hashSync(password, bcrypt.genSaltSync(9));
    return password;
};

module.exports.validPassword = function (password, encryptedPassword) {
    //return bcrypt.compareSync(password, encryptedPassword);
    return (password == encryptedPassword);
};