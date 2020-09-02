const express = require('express');
const PORT = process.env.PORT || 5000;
const app = express();
const bodyParser = require('body-parser');
var morgan = require('morgan');
const dotenv = require('dotenv');
// dotenv.config();

// api code

var fs = require('fs');

var cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name : 'hrvstzfty',
  api_key    : '566594632571262',
  api_secret : process.env.CLOUDINARY_SECRET
});
console.log(process.env.CLOUDINARY_SECRET);
app.use(bodyParser.json());
app.use(morgan('combined'));

app.get('/', function(req, res) {
  res.send(
    '<form method="post" enctype="multipart/form-data">' +
      '<p>Public ID: <input type="text" name="title"/></p>' +
      '<p>Image: <input type="file" name="image"/></p>' +
      '<p><input type="submit" value="Upload"/></p>' +
      '</form><p>' +
      process.env.CLOUDINARY_SECRET +
      '</p>'
  );
});

app.post('/', function(req, res, next) {
  stream = cloudinary.uploader.upload_stream(
    function(result) {
      console.log(result);
      res.send(
        'Done:<br/> <img src="' +
          result.url +
          '"/><br/>' +
          cloudinary.image(result.public_id, {
            format : 'png',
            width  : 100,
            height : 130,
            crop   : 'fill'
          })
      );
    },
    { public_id: req.body.title }
  );
  fs
    .createReadStream(req.files.image.path, { encoding: 'binary' })
    .on('data', stream.write)
    .on('end', stream.end);
});

app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
  console.log('melee server spectate http://localhost:' + PORT);
});
