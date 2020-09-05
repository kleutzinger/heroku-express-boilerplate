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
    if (typeof client !== 'undefined') {
      client.release();
    }
  }
}

async function get_upload_history(chronological = false) {
  try {
    const client = await pool.connect();
    // const text = `SELECT * from upload_history INNER JOIN slippi_meta on upload_history.filename=slippi_meta.filename ORDER BY created_at desc;`;
    let text = `SELECT * from slp_history `;
    if (chronological) {
      text += 'ORDER BY start_at desc ';
    }
    text += ';';
    resp = await client.query(text);
    client.release();
    return resp;
  } catch (err) {
    console.log(err);
    if (typeof client !== 'undefined') {
      client.release();
    }
  }
}

app.get('/history', async (req, res) => {
  const data = await get_upload_history();
  res.json(data.rows);
});

module.exports = {
  apiRouter          : app,
  new_processed_push,
  get_upload_history
};
