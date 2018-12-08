const uniqid = require("uniqid");
const ROT = require("rot-js");

const World = require('./../utility/global');
const WorldTile = require("./WorldTile");
const { randBetween, displayError } = require("./../utility/utility");

class WorldMap {
  constructor(config) {
    this.id = uniqid();
    this.name = config.name;
    this.mapWidth = config.mapWidth || 60;
    this.mapHeight = config.mapHeight || 30;
    this.mapTemp = config.mapTemp || 20;
    this.mapType = config.mapType || "Cellular";
    this.tileMap = {};

    // Generate the map itself
    this.mapType === "Cellular"
      ? this.generateCellularMap()
      : this.generateMapByType({ mapType: this.mapType });

    World.allMaps.push(this);
  }

  getTileAt(coords) {
    // key is in form [x, y]
    return this.tileMap[`${coords[0]},${coords[1]}`];
  }

  getEmptyTile() {
    let randomTile = null;
    for (let i = 0; i < 9999; i++) {
      const randomX = randBetween(0, this.mapWidth - 1);
      const randomY = randBetween(0, this.mapHeight - 1);
      if (!this.getTileAt([randomX, randomY]).wall) {
        randomTile = this.getTileAt([randomX, randomY]);
        break;
      }
    }
    if (!randomTile) return displayError("No empty tile found", this.name, 'getEmptyTile');
    return randomTile;
  }

  generateCellularMap() {
    const map = new ROT.Map.Cellular(this.mapWidth, this.mapHeight, {
      connected: true
    });

    map.randomize(0.5);
    for (let i = 0; i < 5; i += 1) {
      map.create();
    }
    map.connect(
      null,
      1
    );

    for (let i = 0; i < this.mapWidth; i++) {
      for (let j = 0; j < this.mapHeight; j++) {
        const key = i + "," + j;
        if (map._map[i][j]) {
          this.tileMap[key] = new WorldTile(i, j, this.id, false);
          this.tileMap[key].char = ".";
        } else {
          this.tileMap[key] = new WorldTile(i, j, this.id, true);
          this.tileMap[key].char = "#";
        }
      }
    }
  }

  generateMapByType(mapConfig) {
    let map = null;
    if (mapConfig.mapType === "Arena") {
      map = new ROT.Map.Arena(this.mapWidth, this.mapHeight);
    } else if (mapConfig.mapType === "Rogue") {
      map = new ROT.Map.Rogue(this.mapWidth, this.mapHeight);
    } else if (mapConfig.mapType === "EllerMaze") {
      map = new ROT.Map.EllerMaze(this.mapWidth, this.mapHeight);
    }

    const createMapCallback = function(x, y, isWall) {
      const key = x + "," + y;
      if (isWall) {
        this.tileMap[key] = new WorldTile(x, y, this.id, isWall);
        this.tileMap[key].char = "#";
        return;
      }
      this.tileMap[key] = new WorldTile(x, y, this.id, isWall);
      this.tileMap[key].char = ".";
    };
    map.create(createMapCallback.bind(this));
  }
}

module.exports = WorldMap;
