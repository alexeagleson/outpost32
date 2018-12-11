require('dotenv').config();

const history = require('connect-history-api-fallback');

const World = require('./utility/global');
const App = require('./routes');
const Player = require('./constructors/Player');
const Projectile = require('./constructors/Projectile');
const Visual = require('./utility/Visual');
const createMap = require('./content/createMap');
const createObject = require('./content/createObject');
const { runXTimes } = require('./utility/utility');

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

runXTimes(() => {
  const rock = createObject('Rock');
  rock.placeRandom({ worldMap: map });
}, 15);


setInterval(() => {
  const rock = createObject('Rock');
  rock.placeRandom({ worldMap: map });
  new Projectile({
    projectileObject: rock,
    destinationCoords: [20, 20],
    speed: 200,
  });
}, 200);














io.on('connection', socket => {
  console.log('Player connected: ' + socket.id);

  const newPlayerObject = createObject('Player', socket.handshake.query.user);
  socket.player = new Player(socket.id, newPlayerObject);
  socket.player.myObject.placeRandom({ worldMap: map });

  const visual = new Visual();

  socket.on('map', () => {
    io.emit('map', map);
  });

  socket.on('whatsThis', coords => {
    const objectsOnTile = World.allObjects.filter(worldObject => worldObject.getTile().x === coords[0] && worldObject.getTile().y === coords[1]);
    if (objectsOnTile.length > 0) {
      io.to(`${socket.id}`).emit('whatsThis', visual.objectToVis(objectsOnTile[0]));
    }
  });

  socket.on('move', moveData => {
    if (socket.player.myObject.Moving.moveRelative([moveData.dx, moveData.dy])) {
      const stuffToDraw = [];
      World.allObjects.forEach(worldObject => {
        stuffToDraw.push(visual.objectToVis(worldObject));
      });

      io.to(`${socket.id}`).emit('updateCamera', {
        x: socket.player.myObject.getTile().x,
        y: socket.player.myObject.getTile().y,
      });

      io.emit('moveOk', stuffToDraw);

    }
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected: ' + socket.id);
    World.allPlayers = World.allPlayers.filter(player => player.socketId !== socket.id);
    socket.player.myObject.removeFromUniverse();
  });
});
