var express = require('express');
var multer = require('multer');
var upload = multer(); // If 'dest' is not specified, the files will be stored in a memory buffer

var app = express();

app.post('/profile', upload.single('avatar'), function (req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
});

app.post('/photos/upload', upload.array('photos', 12), function (req, res, next) {
    // req.files is array of `photos` files
    // req.body will contain the text fields, if there were any
});

// main function
var cpUpload = upload.fields([{name: 'avatar', maxCount: 1}, {name: 'gallery', maxCount: 8}]);
app.post('/fileupload', cpUpload, function (req, res, next) {
    // req.files is an object (String -> Array) where fieldname is the key, and the value is array of files
    // req.body will contain the text fields, if there were any

    console.log("body", req.body);
    console.log("files", req.files);

    var newpath = req.files.avatar[0].originalname;
    console.log("newpath", newpath);
    var fs = require('fs');
    fs.writeFile(newpath, req.files.avatar[0].buffer, function (err) {
        if (err) {
            console.log(err);
            res.write('File upload not successful...');
            res.end();
            return;
        }
        res.write('File uploaded and moved!');
        res.end();
    });
});

app.get('/', function (req, res, next) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="./fileupload" method="post" enctype="multipart/form-data">');
    res.write('<label>Name: </label><input type="text" name="nameStr"><br>');
    res.write('<label>Avatar: </label><input type="file" multiple="multiple" name="avatar"><br>');
    res.write('<label>Gallery: </label><input type="file" multiple="multiple" name="gallery"><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    return res.end();
});

app.listen(3000, function (err) {
    if (err) {
        console.log("Server did not start due to error: " + JSON.stringify(err));
    }
    console.log("Listening on localhost:3000");
});