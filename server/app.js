require('dotenv').config();

const history = require('connect-history-api-fallback');

const World = require('./utility/global');
const App = require('./routes');
const Player = require('./constructors/Player');
const createMap = require('./content/createMap');
const createObject = require('./content/createObject');

// CORS middleware
const allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
};

const localDB = {
  connectionLimit: 10,
  host: process.env.DB_HOST_LOCAL,
  port: process.env.DB_PORT_LOCAL,
  user: process.env.DB_USER_LOCAL,
  password: process.env.DB_PASS_LOCAL,
  database: process.env.DB_NAME_LOCAL,
};

const remoteDB = {
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

const dbLocal = true;
const dbConfig = dbLocal ? localDB : remoteDB;

const appWithDB = new App(dbConfig);
const app = appWithDB.express;

app.use(allowCrossDomain);
app.use(history());

const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT;

http.listen(port, () => {
  console.log(`Listening on ${port}`);
});

process.on('SIGINT', () => {
  appWithDB.sql.pool.end(() => {
    console.log('All database connections closed & server shut down.');
    process.exit();
  });
});

const map = createMap('Test Map');

io.on('connection', socket => {
  console.log('Player connected: ' + socket.id);

  const newPlayerObject = createObject('Player', socket.handshake.query.user);
  socket.player = new Player(socket.id, newPlayerObject);
  socket.player.myObject.placeRandom({ worldMap: map });

  socket.on('map', () => {
    io.emit('map', map);
  });

  socket.on('move', moveData => {
    if (socket.player.myObject.Moving.moveRelative([moveData.dx, moveData.dy])) {
      const stuffToDraw = [];
      World.allPlayers.forEach(player => {
        const tileInfo = player.myObject.getTile();
        stuffToDraw.push({
          socketId: player.socketId,
          x: tileInfo.x,
          y: tileInfo.y,
          char: player.myObject.char,
          colour: player.myObject.colour,
        });
      });

      let xx = 10;
      let yy = 10;

      const speed = 50;
      const duration = 1000;

      const inter = setInterval(() => {
        const drawObject = ({
          x: xx,
          y: yy,
          char: map.getTileAt([xx, yy]).char,
          colour: 'WHITE',
        })
        io.emit('drawThis', drawObject);
        xx += 1;
        yy += 1;
        const drawObject2 = ({
          x: xx,
          y: yy,
          char: '*',
          colour: 'GREEN',
        })
        io.emit('drawThis', drawObject2);
      }, speed);

      setTimeout(() => {
        const drawObject = ({
          x: xx,
          y: yy,
          char: map.getTileAt([xx, yy]).char,
          colour: 'WHITE',
        })
        io.emit('drawThis', drawObject);
        clearInterval(inter);
      }, duration + (speed - 1))
      


      io.emit('moveOk', stuffToDraw);
    }
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected: ' + socket.id);
    World.allPlayers = World.allPlayers.filter(player => player.socketId !== socket.id);
    World.allObjects = World.allObjects.filter(worldObject => worldObject !== socket.player.myObject);
  });
});
