const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const socketIO = require('socket.io');
const PORT = process.env.PORT || 5000;
const app = express();

const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');

const path = require('path');
var fs = require('fs');
app.use(bodyParser.json());

app.set('view engine', 'pug');
// app.use(multer({ dest: './tmp' }).any());

const { apiRouter } = require('./api.js');
app.use(require('serve-favicon')(path.join('web', 'monocle.ico')));
app.use(express.static('web'));
app.use(morgan('tiny'));

const server = app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
  console.log('melee server spectate http://localhost:' + PORT);
});
/// -- SOCKETZ
const io = socketIO(server);

const uploadRouter = require('./upload_ingester.js')(io);
app.use('/upload', uploadRouter); // Forwards any requests to the /albums URI to our albums Router
app.use('/api', apiRouter);

app.get('/', function(req, res) {
  res.render('home', {});
});

io.on('connection', (socket) => {
  // console.log('Client connected');
  // socket.emit('history', {});
  socket.on('disconnect', () => {
    //console.log('client disc')
  });
});
