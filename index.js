const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const socketIO = require('socket.io');
const PORT = process.env.PORT || 5000;
const app = express();
const _ = require('lodash');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const path = require('path');
var fs = require('fs');
app.use(bodyParser.json());

app.set('view engine', 'pug');
// app.use(multer({ dest: './tmp' }).any());

app.use(require('serve-favicon')(path.join('web', 'monocle.ico')));
app.use(express.static('web'));
if (!fs.existsSync('slp')) {
  fs.mkdirSync('slp');
}

// Middleware to set the X-Robots-Tag header for /slp/ files
app.use('/slp', (req, res, next) => {
  res.set('X-Robots-Tag', 'noindex, nofollow');
  next();
});

app.use('/slp', express.static('slp'));
app.use(morgan('tiny'));

app.use('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.sendFile(path.join(__dirname, 'web', 'robots.txt'));
});

const server = app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
  console.log('melee server spectate http://localhost:' + PORT);
});
/// -- SOCKETZ
const io = socketIO(server);

const uploadRouter = require('./upload_ingester.js')(io);
app.use('/upload', uploadRouter); // Forwards any requests to the /albums URI to our albums Router

const { apiRouter, get_upload_history } = require('./api.js');
app.use('/api', apiRouter);

app.get('/', async function (req, res, next) {
  try {
    const upload_history = await get_upload_history();
    const rows = upload_history ? upload_history.rows : [];
    res.render('home', { upload_history: JSON.stringify(rows) });
  } catch (error) {
    next(error);
  }
});

io.on('connection', (socket) => {
  // console.log('Client connected');
  // socket.emit('history', {});
  socket.on('disconnect', () => {
    //console.log('client disc')
  });
});
