const World = require('./../utility/global');

class WorldTile {
  constructor(x, y, id, wall, fgColour, bgColour) {
    this.x = x;
    this.y = y;
    this.mapId = id;
    this.wall = wall;
    this.char = null;
    this.fgColour = fgColour || 'WHITE';
    this.bgColour = bgColour || 'BLACK';
  }

  getCoords() {
    return [this.x, this.y];
  }

  checkBlocked() {
    const objectBlocking = World.allObjects.find(object => object.getTile() === this);
    if (objectBlocking) return true;
    return this.wall;
  }
}

module.exports = WorldTile;
