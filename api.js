const dotenv = require('dotenv');
dotenv.config();
const _ = require('lodash');
const pool = require('./db_setup.js');
const { default: SlippiGame } = require('@slippi/slippi-js');

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

async function new_processed_push(obj) {
  // object is slp-parsed, stored online
  // now insert all into db
  try {
    let { metadata, nice, is_temp, dl_url, filename, filesize } = obj;
    const start_at = Date.parse(nice.start_at);
    const client = await pool.connect();
    const text = `
    INSERT INTO slp_history
      (filename, dl_url, is_temp, settings_tag, filesize, metadata, start_at) 
      VALUES($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [
      filename,
      dl_url,
      is_temp,
      nice.settings_tag,
      filesize,
      metadata,
      nice.start_at
    ];
    const resp = await client.query(text, values);
    client.release();
    console.log(resp);
    return resp;
  } catch (err) {
    console.log(err);
    client.release();
  }
}

async function new_upload(dl_url, metadata = {}) {
  try {
    const filename = dl_url.split('/').pop();
    const client = await pool.connect();
    const text = 'INSERT INTO upload_history(dl_url, filename) VALUES($1, $2);';
    const values = [ dl_url, filename ];
    const resp = await client.query(text, values);
    client.release();
    return resp;
  } catch (err) {
    client.release();
    console.log(err);
  }
}

async function new_metadata(filename, metadata = {}, nice = {}) {
  try {
    filename = filename.split('/').pop();
    const { niceData } = require('./web/client-utils.js');
    const client = await pool.connect();
    const text = 'INSERT INTO slippi_meta(filename, metadata) VALUES($1, $2);';
    const values = [ filename, metadata ];
    const resp = await client.query(text, values);
    client.release();
    return resp;
  } catch (err) {
    client.release();
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
    // const text = `SELECT * from upload_history INNER JOIN slippi_meta on upload_history.filename=slippi_meta.filename ORDER BY created_at desc;`;
    const text = `
    SELECT *
    from slp_history
    ORDER BY start_at desc;
`;
    resp = await client.query(text);
    client.release();
    return resp;
  } catch (err) {
    console.log(err);
    client.release();
  }
}

app.get('/history', async (req, res) => {
  const data = await get_upload_history();
  res.json(data.rows);
});

module.exports = {
  apiRouter          : app,
  new_upload,
  new_processed_push,
  get_upload_history,
  new_metadata
};
