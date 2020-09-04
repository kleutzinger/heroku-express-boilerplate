const create_str = `
   CREATE TABLE tournament(
   id SERIAL NOT NULL PRIMARY KEY,
   name           TEXT    NOT NULL DEFAULT '',
   bracket_url    TEXT    NOT NULL DEFAULT '',
   slp_filecount INT NOT NULL DEFAULT 0,
   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

const upload_history = `
   CREATE TABLE upload_history(
   id         SERIAL NOT NULL PRIMARY KEY,
   dl_url     TEXT    NOT NULL DEFAULT '',
   filename   text    NOT NULL DEFAULT '',
   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;
const slippi_meta = `
  CREATE TABLE slippi_meta(
  id         SERIAL NOT NULL PRIMARY KEY,
  filename   text    NOT NULL DEFAULT '',
  metadata   jsonb   not null default '{}'::jsonb
  );
`;
const dotenv = require('dotenv');
dotenv.config();
const pool = require('./db_setup.js');
const app = require('express').Router();

function new_tournament(client, name = 'none', url = 'https://smash.gg') {
  const text =
    'INSERT INTO tournament(name, bracket_url) VALUES($1, $2) RETURNING *';
  const values = [ name, url ];

  client
    .query(text, values)
    .then((res) => {
      console.log(res.rows[0]);
      // { name: 'brianc', email: 'brian.m.carlson@gmail.com' }
    })
    .catch((e) => console.error(e.stack));
}

async function new_upload(dl_url, metadata = {}) {
  try {
    const filename = dl_url.split('/').pop();
    const client = await pool.connect();
    const text = 'INSERT INTO upload_history(dl_url, filename) VALUES($1, $2);';
    const values = [ dl_url, filename ];
    return client.query(text, values);
  } catch (err) {
    console.log(err);
  }
}

async function new_metadata(filename, metadata = {}) {
  try {
    filename = dl_url.split('/').pop();
    const client = await pool.connect();
    const text = 'INSERT INTO slippi_meta(filename, metadata) VALUES($1, $2);';
    const values = [ filename, metadata ];
    return client.query(text, values);
  } catch (err) {
    console.log(err);
  }
}

function update_tournament(client, id, key, val) {
  const text = `UPDATE tournament
        SET ${key} = '${val}'
        WHERE id = ${id}
        RETURNING *;`;
  const values = [];

  client
    .query(text, values)
    .then((res) => {
      console.log(res.rows[0]);
      // { name: 'brianc', email: 'brian.m.carlson@gmail.com' }
    })
    .catch((e) => console.error(e.stack));
}

function list_tournaments(client, callback) {
  client
    .query('SELECT * from tournament order by created_at desc;')
    .then((res) => {
      // console.log(res.rows[0]);
      callback(res.rows);
    })
    .catch((e) => console.error(e.stack));
}

async function get_upload_history() {
  try {
    const client = await pool.connect();
    const text = 'SELECT * from upload_history order by created_at desc;';
    resp = await client.query(text);
    return resp;
  } catch (err) {
    console.log(err);
  }
}

app.get('/db', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM tournament');
    const results = { results: result ? result.rows : null };
    res.json(results);
    client.end();
  } catch (err) {
    console.error(err);
    res.send('Error ' + err);
  }
});

app.get('/history', async (req, res) => {
  const data = await get_upload_history();
  res.json(data.rows);
});

module.exports = {
  apiRouter: app,
  new_upload,
  get_upload_history,
  new_metadata
};
