const dotenv = require('dotenv');
dotenv.config();
const multer = require('multer');
const { nanoid } = require('nanoid/non-secure');
const tmpdir = 'tmp';
const { existsSync, mkdirSync } = require('fs');
const fs = require('fs');
const { basename } = require('path');
const fetch = require('node-fetch');
const _ = require('lodash');
const FormData = require('form-data');

const app = require('express').Router();

if (!existsSync(tmpdir)) {
  mkdirSync(tmpdir, { recursive: true });
}

const storage = multer.diskStorage({
  destination : function(req, file, cb) {
    cb(null, tmpdir);
  },
  filename    : function(req, file, cb) {
    cb(null, `${nanoid(7)}-${file.originalname}`);
    // cb(null, `${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits  : { fileSize: 1024 * 1024 * 10 }
});

app.post('/', upload.any(), async function(req, res) {
  try {
    let files = req.files || [ req.file ];
    _.map(files, (f) => {
      processUpload(f.path);
    });
    console.log('Got ' + files.length + ' files');
    res.sendStatus(200);
  } catch (err) {
    console.log('file error, or no file?');
    res.sendStatus(400);
  }
});

async function processUpload(_path) {
  try {
    const download_server = 'http://kevbot.xyz/download/slp';
    const output_filename = basename(_path);
    const download_url = download_server + '/' + output_filename;
    const formData = new FormData();

    formData.append('files[]', fs.createReadStream(_path), basename(_path));
    // await rc.post(process.env.SECRET_UPLOAD_KB, formData, {
    //   headers : formData.getHeaders()
    // });

    fetch(process.env.SECRET_UPLOAD_KB, { method: 'POST', body: formData })
      .then(function(res) {
        return res.json();
      })
      .then(function(json) {
        console.log(json);
      })
      .catch((err) => {
        console.log(err);
      });

    console.log(_path, '\n', download_url);
  } catch (err) {
    console.log(err);
  }
}

module.exports = app;
