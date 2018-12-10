const uniqid = require('uniqid');
const World = require('./../utility/global');
const Moving = require('./object-components/Moving');

class WorldObject {
  constructor(config) {
    this.id = uniqid();
    this.name = config.name;
    this.type = config.type;
    this.char = config.char || '?';
    this.colour = config.colour || 'PINK';
    this.worldMap = null;
    this.worldTile = null;

    World.allObjects.push(this);
  }

  place(locationData) {
    const map = locationData.worldMap;
    const coords = locationData.coords;
    this.worldMap = map;
    this.worldTile = map.getTileAt(coords);
    return true;
  }

  placeRandom(locationData) {
    const map = locationData.worldMap;
    this.worldMap = map;
    const emptyTile = map.getEmptyTile();
    return this.place({ worldMap: map, coords: [emptyTile.x, emptyTile.y] });
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
