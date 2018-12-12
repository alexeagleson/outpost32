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
    this._objectsOnTile = [];
  }

  getCoords() {
    return [this.x, this.y];
  }

  getObjectsOnTile() {
    return this._objectsOnTile;
  }

  occupied() {
    return this._objectsOnTile.length > 0;
  }

  removeObject(worldObject) {
    return this._objectsOnTile = this._objectsOnTile.filter(objectOnTile => objectOnTile !== worldObject);
  }

  addObject(worldObject) {
    return this._objectsOnTile.push(worldObject);
  }

  checkBlocked() {
    const objectBlocking = World.allObjects.find(object => object.getTile() === this);
    if (objectBlocking) return objectBlocking;
    return this.wall;
  }


}

module.exports = WorldTile;
