const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const path = require("path");
const uniqid = require("uniqid");
const mysql = require("mysql");
const history = require("connect-history-api-fallback");

// CORS middleware
const allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
};

const distPath = path.join(__dirname, "..", "dist");
const jwtSecret = "sadsaf7dsasd292mde963329";
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
                  currentUser.generateAuthToken(jwtSecret);
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
                  currentUser.generateAuthToken(jwtSecret);
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

require("dotenv").config();

const localDatabaseConfig = {
  connectionLimit: 10,
  host: process.env.DB_HOST_LOCAL,
  port: process.env.DB_PORT_LOCAL,
  user: process.env.DB_USER_LOCAL,
  password: process.env.DB_PASS_LOCAL,
  database: process.env.DB_NAME_LOCAL
};

// const databaseConfig = {
//   connectionLimit: 10,
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: process.env.DB_NAME
// };

const appWithDB = new App(localDatabaseConfig);
const app = appWithDB.express;

app.use(allowCrossDomain);
app.use(history());

const port = process.env.PORT;

var http = require('http').Server(app);
var io = require('socket.io')(http);

const ROT = require('rot-js');

const map = new ROT.Map.Cellular(10, 8, {connected: true});

// Cells have a 1/2 probability
map.randomize(0.5);
for (let i = 0; i < 5; i++) {
  // Run a few generations
  map.create();
}
map.connect(null, 1);

const tileMap = [];

for (let i = 0; i < 10; i++) {
  for (let j = 0; j < 8; j ++) {
    const key = i + ',' + j;
    tileMap[key] = {};
    if (map._map[i][j]) {
      tileMap[key].char = ".";
    } else {
      tileMap[key].char = "#";
    }
  }
}

console.log(tileMap);


io.on('connection', (socket) => {
  console.log('a user connected');
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
    // io.emit('some event', { for: 'everyone' });
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
