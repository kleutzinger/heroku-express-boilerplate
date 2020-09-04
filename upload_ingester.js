const dotenv = require('dotenv');
dotenv.config();
const app = require('express').Router();
const multer = require('multer');
const { nanoid } = require('nanoid/non-secure');
const tmpdir = 'tmp';
const { existsSync, mkdirSync } = require('fs');
const fs = require('fs');
const { basename } = require('path');
const fetch = require('node-fetch');
const _ = require('lodash');
const FormData = require('form-data');
const { new_upload } = require('./api.js');
const { handle_slippi_file } = require('./slippi_wrangler.js');

if (!existsSync(tmpdir)) {
  mkdirSync(tmpdir, { recursive: true });
}

const storage = multer.diskStorage({
  destination : function(req, file, cb) {
    cb(null, tmpdir);
  },
  filename    : function(req, file, cb) {
    let filename = file.originalname;
    filename = filename.replace(/[^a-z0-9\.-]/gi, '_');
    cb(null, `${nanoid(7)}-${filename}`);
    // cb(null, `${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits  : { fileSize: 1024 * 1024 * 10 }
});

async function processUpload(_path, io) {
  try {
    const output_filename = basename(_path);
    const formData = new FormData();

    formData.append('files[]', fs.createReadStream(_path), basename(_path));
    fetch(process.env.SECRET_UPLOAD_KB, { method: 'POST', body: formData })
      .then(function(res) {
        return res.json();
      })
      .then(function(json) {
        // file uploaded succcessfully
        const { dl_url } = json;
        if (dl_url) {
          console.log(dl_url);
          io.sockets.emit('new_upload', { dl_url });
          new_upload(dl_url).then(() => {
            // console.log('uploaded to history');
          });
          if (_path.endsWith('.slp')) {
            handle_slippi_file(_path);
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
  }
}

var returnRouter = function(io) {
  app.post('/', upload.any(), async function(req, res) {
    try {
      let files = req.files || [ req.file ];
      _.map(files, (f) => {
        processUpload(f.path, io);
      });
      console.log('Got ' + files.length + ' files');
      res.sendStatus(200);
    } catch (err) {
      console.log('file error, or no file?');
      res.sendStatus(400);
    }
  });

  return app;
};

module.exports = returnRouter;
