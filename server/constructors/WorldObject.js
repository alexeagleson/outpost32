const uniqid = require('uniqid');
const World = require('./../utility/global');

class WorldObject {
  constructor(config) {
    this.id = uniqid();
    this.name = config.name;
    this.type = config.type;
    this.char = config.char || '?';
    this.fgColour = config.fgColour || 'PINK';
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

  removeFromUniverse() {
    World.allObjects = World.allObjects.filter(worldObject => worldObject !== this);
  }

  getMap() {
    return this.worldMap || false;
  }

  getTile() {
    return this.worldTile || false;
  }
}

module.exports = WorldObject;
