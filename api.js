const dotenv = require('dotenv');
dotenv.config();
const _ = require('lodash');
const pool = require('./db_setup.js');
const { default: SlippiGame } = require('@slippi/slippi-js');
const squid = require('./squid_setup.js').squid;

const app = require('express').Router();

async function new_processed_push(obj) {
  // object is slp-parsed, stored online
  // now insert all into db
  try {
    // prettier-ignore
    let { metadata, nice, uniq_tag, is_temp, dl_url, hosted_filename, filesize } = obj;
    const start_at = Date.parse(nice.start_at);
    const client = await pool.connect();
    const text = `
    INSERT INTO slp_history
      (hosted_filename, dl_url, is_temp, uniq_tag, filesize, metadata, start_at) 
      VALUES($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = {
      hosted_filename,
      dl_url,
      is_temp,
      uniq_tag,
      filesize,
      metadata,
      start_at: nice.start_at
    }
    const resp = await client.query(text, values);
    client.release();
    // console.log(resp);
    return resp;
  } catch (err) {
    console.log(err.message);
    if (typeof client !== 'undefined') {
      client.release();
    }
  }
}

async function get_upload_history(chronological = false) {
  try {
    const client = await pool.connect();
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

async function run_text_values(text, values) {
  try {
    const client = await pool.connect();
    resp = await client.query(text, values);
    client.release();
    return resp;
  } catch (err) {
    console.log(err);
    if (typeof client !== 'undefined') {
      client.release();
    }
  }
}
(async () => {
  return;
  const between_times_text = ` 
-- goal: get all timestamps between time0 and time1 ?
-- where $[minus_time, plus_time]


SELECT 
  CASE WHEN EXISTS 
    (  SELECT id, start_at, settings_tag from slp_history where ( 
  start_at >= $1 AND start_at <= $2) 
)
  THEN insert into upload_history  
  ELSE 0
  END ;
`;
  const data = await get_upload_history((chronological = true));
  const game = data.rows[0];
  const start_at = Date.parse(game.start_at);

  const values = [
    new Date(start_at - 5 * 1000),
    new Date(start_at + 5 * 1000)
  ];

  console.log(values);
  // process.exit();
  var resp = await run_text_values(between_times_text, values);
  console.log(resp.rows);
})().catch((e) => {
  console.log(e);
  // Deal with the fact the chain failed
});

app.get('/history', async (req, res) => {
  try {
    const data = await get_upload_history((chronological = true));
    res.json(data.rows);
  } catch (error) {
    console.log('error getting /history', error.message);
  }
});

module.exports = {
  apiRouter          : app,
  new_processed_push,
  get_upload_history,
  run_text_values
};
