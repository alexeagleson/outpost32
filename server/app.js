const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const path = require("path");
const uniqid = require("uniqid");
const mysql = require("mysql");
const history = require("connect-history-api-fallback");
require("dotenv").config();

const World = require('./global');
const WorldMap = require('./constructors/WorldMap');
const WorldObject = require('./constructors/WorldObject');


// CORS middleware
const allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
};

const distPath = path.join(__dirname, "..", "dist");
const port = process.env.PORT;
const secret = process.env.JWT_SECRET;
const saltRounds = 10;

class SQLHandler {
  constructor(databaseConfig) {
    this.config = databaseConfig;
    this.pool = null;
  }

  connect() {
    this.pool = mysql.createPool(this.config);
  }
}

class User {
  constructor(username) {
    this.id = uniqid();
    this.username = username;
  }

  generateAuthToken(jwtSecret) {
    this.token = jwt.sign(this.username, jwtSecret);
  }
}

const validateUsername = (textValue, formName, min = null, max = null) => {
  if (!(typeof textValue === "string")) return `${formName} must be text.`;
  if (textValue.length === 0) return `${formName} cannot be empty.`;
  if (
    min !== null &&
    max !== null &&
    (textValue.length < min || textValue.length > max)
  )
    return `${formName} must be between ${min} and ${max} characters long.`;
  const matchValidBasicUsername = textValue.match(/^[a-zA-Z0-9_ .-]*$/);
  if (!matchValidBasicUsername)
    return `${formName} can only contain basic letters and numbers.`;
  return true;
};

class App {
  constructor(config) {
    this.express = express();
    this.sql = null;
    this.configureRendering();
    this.connectToDatabase(config);
    this.mountRoutes();
  }

  configureRendering() {
    this.express.use(express.static(distPath));
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: true }));
  }

  mountRoutes() {
    const router = express.Router();

    router.get("/newtable", (req, res) => {
      this.sql.pool.query(
        `CREATE TABLE IF NOT EXISTS users (
          id varchar(18) NOT NULL,
          username varchar(100) NOT NULL,
          password char(60) NOT NULL,
          PRIMARY KEY (id)
        )`,
        () => {
          res.status(200).send();
        }
      );
    });

    router.post("/login", (req, res) => {
      let formError = validateUsername(
        req.body.username,
        "Username",
        1,
        20
      );
      if (typeof formError === "string") {
        return res.header("x-auth", "error").send({ error: formError });
      }

      this.sql.pool.query(
        `SELECT username, password FROM users WHERE username = ?`,
        [req.body.username],
        (error, passwordResult) => {
          if (passwordResult && passwordResult.length > 0) {
            bcrypt
              .compare(req.body.password, passwordResult[0].password)
              .then(compareResult => {
                if (compareResult) {
                  const currentUser = new User(passwordResult[0].username);
                  currentUser.generateAuthToken(secret);
                  res
                    .header("x-auth", currentUser.token)
                    .send({ username: passwordResult[0].username, token: currentUser.token });
                } else {
                  res
                    .header("x-auth", "error")
                    .send({ error: "Password did not match." });
                }
              });
          } else {
            res
              .header("x-auth", "error")
              .send({ error: "Username not found." });
          }
        }
      );
    });

    router.post("/register", (req, res) => {
      let formError = validateUsername(req.body.username, "Username", 1, 20);
      if (typeof formError === "string")
        return res.header("x-auth", "error").send({ error: formError });

      this.sql.pool.query(
        `SELECT username FROM users WHERE username = ?`,
        [req.body.username],
        (error, checkUsername) => {
          if (checkUsername && checkUsername.length > 0) {
            res
              .header("x-auth", "error")
              .send({ error: "Username already registered." });
          } else {
            bcrypt.hash(req.body.password, saltRounds).then(hash => {
              this.sql.pool.query(
                `INSERT INTO users (id, username, password) VALUES (?, ?, ?)`,
                [uniqid(), req.body.username, hash],
                () => {
                  const currentUser = new User(req.body.username);
                  currentUser.generateAuthToken(secret);
                  res
                    .header("x-auth", currentUser.token)
                    .send({ username: req.body.username, token: currentUser.token });
                }
              );
            });
          }
        }
      );
    });

    router.get("/*", (req, res) => {
      res.status(200).sendFile(distPath + '/index.html');
    });

    this.express.use("/", router);
  }

  connectToDatabase(config) {
    this.sql = new SQLHandler(config);
    this.sql.connect();
  }
}

const localDB = {
  connectionLimit: 10,
  host: process.env.DB_HOST_LOCAL,
  port: process.env.DB_PORT_LOCAL,
  user: process.env.DB_USER_LOCAL,
  password: process.env.DB_PASS_LOCAL,
  database: process.env.DB_NAME_LOCAL
};

const remoteDB = {
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
};

const dbLocal = true;
const dbConfig = dbLocal ? localDB : remoteDB;

const appWithDB = new App(dbConfig);
const app = appWithDB.express;

app.use(allowCrossDomain);
app.use(history());

const http = require('http').Server(app);
const io = require('socket.io')(http);

const config = {
  name: 'Worldland',
  mapWidth: 100,
  mapHeight: 75,
  mapType: 'Cellular',
};

const map = new WorldMap(config);

io.on('connection', (socket) => {
  console.log('a user connected: ' + socket.id);

  const newPlayer = new WorldObject({
    name: socket.handshake.query.user,
    socketId: socket.id,
  });

  const emptyTile = map.getEmptyTile();
  newPlayer.placeMe({ worldMap: map, coords: [emptyTile.x, emptyTile.y] });
  newPlayer.applyMoving();
  
  socket.on('map', () => {
    io.emit('map', map);
  });

  socket.on('move', (moveData) => {
    const player = World.allObjects.find(worldObject => worldObject.socketId === socket.id);
    if (player.Moving.moveRelative([moveData.dx, moveData.dy])) {
      const playersDrawInfo = [];
      World.allObjects.forEach((player) => {
        const tileInfo = player.getTile();
        playersDrawInfo.push({
          socketId: player.socketId,
          x: tileInfo.x,
          y: tileInfo.y,
          char: player.char,
        });
      });
      io.emit('moveOk', playersDrawInfo);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected: ' + socket.id);
    World.allObjects = World.allObjects.filter(worldObject => worldObject.socketId !== socket.id);
  });
});

http.listen(port, () => {
  console.log(`listening on ${port}`);
});

process.on("SIGINT", () => {
  appWithDB.sql.pool.end(() => {
    console.log("All database connections closed");
    console.log("Server shut down.");
    process.exit();
  });
});
