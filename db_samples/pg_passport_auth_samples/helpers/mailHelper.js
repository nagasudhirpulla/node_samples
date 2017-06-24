// Doesn't work if node js version < 6. Upgrade node - http://exponential.io/blog/install-or-upgrade-nodejs-on-windows/
var nodemailer = require('nodemailer');

module.exports.sendMailViaGmail = function (fromAddress, toAddress, subjectStr, htmlStr, done) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'nagasud@gmail.com',
            pass: 'pass'
        }
    });

    // Send attachments in mail - https://nodemailer.com/message/attachments/
    var mailOptions = {
        from: fromAddress,
        to: toAddress,
        subject: subjectStr,
        html: htmlStr //using this will not send the 'text' attribute contents
    };

    transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
            //console.log(err);
            return done(err);
        } else {
            //console.log('User verification email sent: ' + info.response);
            return done(null, info);
        }
    });
};