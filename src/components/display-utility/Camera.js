class Camera {
    constructor(displayWidth, displayHeight) {
      this.tileX = null;
      this.tileY = null;
      this.displayWidth = displayWidth;
      this.displayHeight = displayHeight;
    }
  
    screenToActual(coords) {
      const cameraX = this.tileX ? this.tileX : 0;
      const cameraY = this.tileY ? this.tileY : 0;
      return [coords[0] + cameraX, coords[1] + cameraY];
    }
  
    actualToScreen(coords) {
      const cameraX = this.tileX ? this.tileX : 0;
      const cameraY = this.tileY ? this.tileY : 0;
      return [coords[0] - cameraX, coords[1] - cameraY];
    }
  
    computeTileCoord(coord, screenSize, mapSize) {
      const halfScreenSize = Math.floor(screenSize / 2);
      if (coord < halfScreenSize) {
        return 0;
      } else if (coord >= mapSize - halfScreenSize) {
        return mapSize - screenSize;
      } else {
        return coord - halfScreenSize;
      }
    }
  
    updatePosition(playerInfo, world) {
      const displayScreenWidth = Math.min(this.displayWidth, world.mapWidth);
      const displayScreenHeight = Math.min(this.displayHeight, world.mapHeight);
      this.tileX = this.computeTileCoord(playerInfo.x, displayScreenWidth, world.mapWidth);
      this.tileY = this.computeTileCoord(playerInfo.y, displayScreenHeight, world.mapHeight);
    }
  }

  export default Camera;