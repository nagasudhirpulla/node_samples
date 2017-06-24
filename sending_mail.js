/* Nodemailer module github page - https://github.com/nodemailer/nodemailer

 Using gmail for node mailer - https://nodemailer.com/usage/using-gmail/, https://www.w3schools.com/nodejs/nodejs_email.asp

 Allow less secure apps in gmail - https://myaccount.google.com/lesssecureapps?pli=1
 */

// Doesn't work if node js version < 6. Upgrade node - http://exponential.io/blog/install-or-upgrade-nodejs-on-windows/
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nagasud@gmail.com',
        pass: 'pass'
    }
});

// Send attachments in mail - https://nodemailer.com/message/attachments/
var mailOptions = {
    from: 'youremail@gmail.com',
    to: ['nagasudhir@posoco.in', 'prashanth@posoco.in'],
    subject: 'Sending Email using Node.js',
    text: 'Just testing the code... ',
    //html: '<h1>Welcome</h1><p>That was easy!</p>', //using this will not send the 'text' attribute contents
    attachments: [
        {   // utf-8 string as an attachment
            filename: 'text1.txt',
            content: 'hello world!'
        },
        {   // binary buffer as an attachment
            filename: 'text2.txt',
            content: new Buffer('hello world!', 'utf-8')
        },
        {   // file on disk as an attachment
            filename: 'text3.txt',
            path: './sample_text.txt'
        },
        {   // filename and content type is derived from path
            path: './sample_text.txt'
        }]
};

transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
});

/* package.json
 {
 "name": "mail_sender",
 "version": "0.0.1",
 "dependencies": {
 "nodemailer": "^4.0.1"
 }
 }
 */