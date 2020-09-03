const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const PORT = process.env.PORT || 5000;
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');

const uploadRouter = require('./upload_ingester.js');

// api code

var fs = require('fs');
app.use(bodyParser.json());

app.set('view engine', 'pug');
// app.use(multer({ dest: './tmp' }).any());
const { Pool } = require('pg');
const pool = new Pool({
  connectionString : process.env.DATABASE_URL,
  ssl              : {
    rejectUnauthorized : false
  }
});

const db = require('./db.js');

app.use(morgan('tiny'));
app.use(express.static('web'));

app.use('/', uploadRouter); // Forwards any requests to the /albums URI to our albums Router

app.get('/', function(req, res) {
  res.render('home', {});
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
