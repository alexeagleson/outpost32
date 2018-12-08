const World = require('./../utility/global');

class WorldTile {
  constructor(x, y, id, wall) {
    this.x = x;
    this.y = y;
    this.mapId = id;
    this.wall = wall;
    this.char = null;
  }

  checkBlocked() {
    console.log(World.allObjects)
    const objectBlocking = World.allObjects.find(object => object.worldTile === this);
    if (objectBlocking) return true;
    return this.wall;
  }
}

module.exports = WorldTile;