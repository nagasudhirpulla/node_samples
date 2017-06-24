var router = require('express').Router();

router.get('/', function (req, res) {
    res.redirect('/home');
});

router.get('/home', function (req, res) {
    //console.log((typeof req.user == 'undefined') ? "undefined" : req.user.username);
    res.render('home', {user: req.user, message: req.flash("signupMessage")});
});

module.exports = router;