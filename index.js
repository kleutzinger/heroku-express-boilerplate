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
app.use(multer({ dest: './tmp' }).any());
const { Pool } = require('pg');
const pool = new Pool({
  connectionString : process.env.DATABASE_URL,
  ssl              : {
    rejectUnauthorized : false
  }
});

const db = require('./db.js');

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

app.get('/db', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM tournament');
    const results = { results: result ? result.rows : null };
    res.json(results);
    client.release();
  } catch (err) {
    console.error(err);
    res.send('Error ' + err);
  }
});

app.get('/db2', async (req, res) => {
  try {
    const client = await pool.connect();
    db.list_tournaments(client, (out) => {
      // console.log(out);
      // client.release();
      res.json(out);
    });
  } catch (err) {
    console.error(err);
    res.send('Error ' + err);
  }
});

app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
  console.log('melee server spectate http://localhost:' + PORT);
});
