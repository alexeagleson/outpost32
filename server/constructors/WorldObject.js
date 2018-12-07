const uniqid = require("uniqid");

const World = require('./../global');
const Moving = require('./object-components/Moving');

class WorldObject {
  constructor(config) {
    this.id = uniqid();
    this.name = config.name;
    this.char = '@';
    this.worldMap = null;
    this.worldTile = null;
    this.socketId = config.socketId;

    World.allObjects.push(this);
  }

  placeMe(locationData) {
    const map = locationData.worldMap;
    const coords = locationData.coords;
    this.worldMap = map;
    this.worldTile = map.getTileAt(coords);
    return true;
  }

  getMap() {
    return this.worldMap || false;
  }

  getTile() {
    return this.worldTile || false;
  }

  applyMoving() {
    this.Moving = new Moving(this);
  }
}

module.exports = WorldObject;
