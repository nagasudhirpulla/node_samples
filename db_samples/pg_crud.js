var squel = require('squel').useFlavour('postgres');
var pool = require('./db_config');
var async = require('async');

// Insertion SQL
var insert_sql =
    squel.insert()
        .into('people_details.people_details')
        .set('username', 'sudhir')
        .set('email', 'nagasudhirpulla@gmail.com')
        .set('password', 'sdvsdvsdv')
        .returning('*')
        .toParam();
// READ SQL
var select_sql =
    squel.select()
        .field("id")
        .field("email")
        .field("password")
        .field("created_at")
        .from("people_details.people_details")
        .where("username IN ?", ["sudhir"])
        .where("email = ?", "nagasudhirpulla@gmail.com")
        .toParam();
// UPDATE SQL
var update_sql =
    squel.update()
        .table("people_details.people_details")
        .set("username", "Sudhir")
        .set("email", "nagasudhirpulla@gmail.com")
        .set("password", "123456")
        .where("username = ?", "sudhir")
        .toParam();
// DELETE SQL
var delete_sql =
    squel.delete()
        .from("people_details.people_details")
        .where("username = ?", "Sudhir")
        .where("email = ?", "nagasudhirpulla@gmail.com")
        .toParam();

console.log("INSERTION SQL ------>", insert_sql);
console.log("SELECTION SQL ------>", select_sql);
console.log("UPDATE SQL ------>", update_sql);
console.log("DELETION SQL ------>", delete_sql);
process.exit(1);
var insertFunction = function (callback) {
    pool.query(insert_sql.text, insert_sql.values, function (err, res) {
        if (err) {
            console.error('error running INSERT query', err);
            return callback(err);
        }
        console.log('INSERT result ======>', res);
        callback(null, {insertResult: res});
    });
};
var selectFunction = function (prevRes, callback) {
    pool.query(select_sql.text, select_sql.values, function (err, res) {
        if (err) {
            console.error('error running SELECT query', err);
            return callback(err);
        }
        console.log('SELECT result ======>', res);
        prevRes.selectResult = res;
        callback(null, prevRes);
    });
};
var updateFunction = function (prevRes, callback) {
    pool.query(update_sql.text, update_sql.values, function (err, res) {
        if (err) {
            console.error('error running UPDATE query', err);
            return callback(err);
        }
        console.log('UPDATE result ======>', res);
        prevRes.updateResult = res;
        callback(null, prevRes);
    });
    /*
     {"command":"UPDATE","rowCount":1,"oid":null,"rows":[],"fields":[],"_parsers":[],"RowCtor":null,"rowAsArray":false}
     */
};
var deleteFunction = function (prevRes, callback) {
    pool.query(delete_sql.text, delete_sql.values, function (err, res) {
        if (err) {
            console.error('error running DELETE query', err);
            return callback(err);
        }
        console.log('DELETE result ======>', res);
        prevRes.deleteResult = res;
        callback(null, prevRes);
    });
};
var functionsArray = [insertFunction, selectFunction, updateFunction, deleteFunction];
async.waterfall([selectFunction], function (err, prevRes) {
    if (err) {
        return console.error('error running ALL the queries', err);
    }
    console.log('ALL queries result ======>', prevRes);
});
