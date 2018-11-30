const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const path = require("path");
const uniqid = require("uniqid");
const mysql = require("mysql");
const history = require("connect-history-api-fallback");
require("dotenv").config();

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
        (a, b, c) => {
          console.log(a);
          console.log(b);
          console.log(c);
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


// ROT JS

const world = {
  width: 60,
  height: 60,
  tileMap: {},
};

let players = [];

const ROT = require('rot-js');

const map = new ROT.Map.Cellular(world.width, world.height, {connected: true});

// Cells have a 1/2 probability
map.randomize(0.5);
for (let i = 0; i < 5; i++) {
  // Run a few generations
  map.create();
}
map.connect(null, 1);

for (let i = 0; i < world.width; i++) {
  for (let j = 0; j < world.height; j++) {
    const key = i + ',' + j;
    if (map._map[i][j]) {
      world.tileMap[key] = ".";
    } else {
      world.tileMap[key] = "#";
    }
  }
}














// SOCKET IO

const http = require('http').Server(app);
const io = require('socket.io')(http);

io.on('connection', (socket) => {
  console.log('a user connected: ' + socket.id);
  players.push({
    name: socket.handshake.query.user,
    x: 20,
    y: 20,
    id: socket.id,
  });
  console.log(players);
  
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
    io.emit('map', world);
    // io.emit('some event', { for: 'everyone' });
  });

  socket.on('move', (moveData) => {
    const updatedPlayer = players.find(singlePlayer => singlePlayer.id === socket.id);
    updatedPlayer.x += moveData.x;
    updatedPlayer.y += moveData.y;
    io.emit('moveOk', players);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected: ' + socket.id);
    players = players.filter((singlePlayer) => singlePlayer.id !== socket.id);
  });
});

http.listen(port, () => {
  console.log(`listening on ${port}`);
});

// app.listen(port, () => {
//   console.log("App is listening on port " + port);
// });

process.on("SIGINT", () => {
  appWithDB.sql.pool.end(() => {
    console.log("All database connections closed");
    console.log("Server shut down.");
    process.exit();
  });
});
