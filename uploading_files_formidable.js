/* https://www.w3schools.com/nodejs/nodejs_uploadfiles.asp
 * Using formidable package - https://www.npmjs.com/package/formidable, https://github.com/felixge/node-formidable
 * */

var http = require('http');
var formidable = require('formidable');
var fs = require('fs');

// files will be over-written
http.createServer(function (req, res) {
    if (req.url == '/fileupload') {
        var form = new formidable.IncomingForm();
        form.multiples = true;
        form.parse(req, function (err, fields, files) {
            console.log("fields", fields);
            console.log("files", files);
            var oldpath = (files.filetoupload.constructor === Array)?files.filetoupload[0].path:files.filetoupload.path;
            var newpath = (files.filetoupload.constructor === Array)?files.filetoupload[0].name:files.filetoupload.name;
            console.log("oldpath", oldpath);
            console.log("newpath", newpath);
            fs.rename(oldpath, newpath, function (err) {
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
    } else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write('<form action="./fileupload" method="post" enctype="multipart/form-data">');
        res.write('<label>Name: </label><input type="text" name="nameStr"><br>');
        res.write('<label>Files: </label><input type="file" multiple="multiple" name="filetoupload"><br>');
        res.write('<label>Other Files: </label><input type="file" multiple="multiple" name="filetoupload2"><br>');
        res.write('<input type="submit">');
        res.write('</form>');
        return res.end();
    }
}).listen(3000);