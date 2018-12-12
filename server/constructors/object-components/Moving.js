class Moving {
  constructor(worldObject) {
    this.owner = worldObject;
  }

  move(coords) {
    const map = this.owner.getMap();
    const tile = map && map.getTileAt(coords);
    if (!tile) return false;
    const checkBlocked = tile.checkBlocked();
    if (!checkBlocked) {
      return this.owner.place({ worldMap: map, coords: coords });
    }
    return checkBlocked;
  }

  moveRelative(relativeCoords) {
    const tile = this.owner.getTile();
    const newX = tile ? tile.x + relativeCoords[0] : null;
    const newY = tile ? tile.y + relativeCoords[1] : null;
    if (tile && newX && newX) return this.move([newX, newY]);
    return false;
  }
}

module.exports = Moving;
