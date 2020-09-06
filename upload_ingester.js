const dotenv = require('dotenv');
dotenv.config();
const app = require('express').Router();
const multer = require('multer');
const { niceData } = require('./web/client-utils.js');
const { customAlphabet } = require('nanoid/non-secure');
// prettier-ignore
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_',7);
const TMPDIR = 'tmp';
const { existsSync, mkdirSync } = require('fs');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const _ = require('lodash');
const FormData = require('form-data');
const { new_processed_push } = require('./api.js');
const { default: SlippiGame, ConsoleConnection } = require('@slippi/slippi-js');

if (!existsSync(TMPDIR)) {
  mkdirSync(TMPDIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination : function(req, file, cb) {
    cb(null, TMPDIR);
  },
  filename    : function(req, file, cb) {
    let { name, ext } = path.parse(file.originalname);
    let safe_basename = name.replace(/[^a-z0-9\.-]/gi, '_');
    cb(null, `${safe_basename}_${nanoid()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits  : { fileSize: 1024 * 1024 * 10 }
});

async function processIncomingFile(file, io) {
  try {
    const _path = file.path;

    if (!_path.endsWith('.slp')) {
      throw new Error('upload was not a .slp file, ignoring');
    }
    // get slippi metadata
    let processed_metadata = getSlippiData(_path);
    // send to public filehost
    let up_resp = await fetch(process.env.SECRET_UPLOAD_KB, {
      method : 'POST',
      body   : genFormData(_path)
    });
    let is_temp = false;
    let up_json = await up_resp.json();
    const { dl_url } = up_json; // the download link to public file
    if (dl_url) {
      console.log(dl_url);
      const nice = niceData(processed_metadata);
      const uniq_tag = nice.settings_tag + nice.start_at;
      let output_obj = {
        metadata        : processed_metadata,
        nice,
        is_temp,
        uniq_tag,
        dl_url,
        hosted_filename : file.path.split('/').pop(),
        // file,
        filesize        : file.size
      };
      const resp = await new_processed_push(output_obj);
      if (resp) {
        io.sockets.emit('new_upload', resp.rows[0]);
        return resp;
      }
    } else {
      throw new Error('upload error: could not get a public dl_url');
    }
  } catch (err) {
    console.log(err.message);
  }
}

function getSlippiData(path) {
  const game = new SlippiGame(path);
  const slp_settings = game.getSettings();
  const slp_metadata = game.getMetadata();
  // const slp_stats = game.getStats();
  // const slp_frames = game.getFrames();
  let metadata = { slp_settings, slp_metadata };
  return metadata;
}

function genFormData(_path) {
  const formData = new FormData();
  formData.append('files[]', fs.createReadStream(_path), path.basename(_path));
  return formData;
}

var returnRouter = function(io) {
  app.post('/', upload.any(), async function(req, res) {
    try {
      let files = req.files || [ req.file ];

      const resp = await processIncomingFile(files[0], io);
      // console.log('Got ' + files.length + ' files');
      if (!resp) {
        throw new Error('bad upload. duplicate?');
      } else {
        res.sendStatus(200);
      }
    } catch (err) {
      // console.log('file error, or no file?');
      console.log(err.message);
      res.sendStatus(400);
    }
  });

  return app;
};
// file = {
//   fieldname: 'file',
//   originalname: 'test.slp',
//   encoding: '7bit',
//   mimetype: 'application/octet-stream',
//   destination: 'tmp',
//   filename: 'test_hUVawpB.slp',
//   path: 'tmp/test_hUVawpB.slp',
//   size: 2059740
// }
module.exports = returnRouter;
