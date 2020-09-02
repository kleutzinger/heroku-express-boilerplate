const express = require('express');
const PORT = process.env.PORT || 5000;
const app = express();
const bodyParser = require('body-parser');
var morgan = require('morgan');
const dotenv = require('dotenv');
dotenv.config();

// api code

var fs = require('fs');

app.use(bodyParser.json());
const multer = require('multer');
app.set('view engine', 'pug');
app.use(multer({ dest: __dirname + '/tmp/' }).any());

app.use(express.static('web'));

app.use(morgan('combined'));

app.get('/', function(req, res) {
  res.render('home', {});
});

app.post('/', function(req, res) {
  console.log(req.files);

  var files = req.files.file;
  if (Array.isArray(files)) {
    // response with multiple files (old form may send multiple files)
    console.log('Got ' + files.length + ' files');
  } else {
    // dropzone will send multiple requests per default
    console.log('Got one file');
  }
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
  console.log('melee server spectate http://localhost:' + PORT);
});
