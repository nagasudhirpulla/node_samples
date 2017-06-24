/*
 * Example_1 https://scotch.io/tutorials/easy-node-authentication-setup-and-local
 * */
var db = require('./config/db');
var Server_params = require('./config/server_params');
var squel = require('squel').useFlavour('postgres');
var express = require('express');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var cors = require('./config/cors');
var favicon = require('serve-favicon');
var passport = require('./config/passport').get();
var flash = require('connect-flash');

var app = express();
var port = process.env.PORT || 3000;

app.use(cors());

app.use(cookieParser());

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(session({
    secret: 'anystringoftext',
    saveUninitialized: true,
    resave: true
}));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


app.use(express.static(__dirname + '/views'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(morgan('dev'));

app.set('json spaces', 1);

app.use(favicon(__dirname + '/public/img/favicon.ico'));

//use for authentication of post requests
app.use('/', require('./controllers/auth'));

app.use('/', require('./controllers/general'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
//because here err: {}
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: err
    });
});

// Connect to DB on start
db.query("SELECT NOW()", [], function (err, res) {
    if (err) {
        console.log('Unable to connect to the database ...');
        process.exit(1);
    } else {
        app.listen(port, function () {
            console.log('Listening on port ' + port + ' ...');
            setCredentials();
        })
    }
});

var setCredentials = function () {
    var select_sql =
        squel.select()
            .from("people_details.server_key_values")
            .toParam();
    db.query(select_sql.text, select_sql.values, function (err, res) {
        if (err) {
            console.error('error running server_params SELECT query', err);
            return callback(err);
        }
        //console.log('SELECT result ======>', JSON.stringify(res));
        var rows = res.rows;
        for (var i = 0; i < rows.length; i++) {
            Server_params.set(rows[i]["key_str"], rows[i]["value_str"]);
        }
        //console.log("gmail_email", Server_params.get("gmail_email"));
        //console.log("gmail_password", Server_params.get("gmail_password"));
    });
};