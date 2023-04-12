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
    const values = {
      hosted_filename,
      dl_url,
      is_temp,
      uniq_tag,
      filesize,
      metadata,
      start_at: nice.start_at,
    };
    console.log(values);
    const resp = await squid
      .collection('slp_history', 'replay-posey')
      .doc()
      .insert(values);
    return resp;
  } catch (err) {
    console.log(err.message);
    if (typeof client !== 'undefined') {
      client.release();
    }
  }
}

async function get_upload_history(squid) {
  const data = await squid
    .collection('slp_history', 'replay-posey')
    .query()
    .sortBy('start_at')
    .snapshot();
  const out = data.map((x) => x.data);
  return out;
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

app.get('/history', async (req, res) => {
  try {
    const data = await get_upload_history(squid);
    res.json(data);
  } catch (error) {
    console.log('error getting /history', error.message);
  }
});

module.exports = {
  apiRouter: app,
  new_processed_push,
  run_text_values,
  get_upload_history,
};
