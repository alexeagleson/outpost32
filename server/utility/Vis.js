const World = require('./global');

const generateTileRender = worldTile => {
  const tileRender = {
    char: worldTile.char,
    fgColour: worldTile.fgColour,
    bgColour: worldTile.fgColour,
    x: worldTile.x,
    y: worldTile.y,
  };
  if (worldTile.occupied()) {
    const topObject = worldTile.getObjectsOnTile()[0];
    tileRender.char = topObject.char;
    tileRender.fgColour = topObject.fgColour;
  }
  return tileRender;
};

const generateMapRender = worldMap => {
  const mapRender = {
    mapWidth: worldMap.mapWidth,
    mapHeight: worldMap.mapHeight,
    tileMap: {},
  };
  for (let i = 0; i < worldMap.mapWidth; i += 1) {
    for (let j = 0; j < worldMap.mapHeight; j += 1) {
      const key = `${i},${j}`;
      mapRender.tileMap[key] = {
        char: worldMap.tileMap[key].char,
        fgColour: worldMap.tileMap[key].fgColour,
        bgColour: worldMap.tileMap[key].bgColour,
      };
    }
  }
  return mapRender;
};

const Vis = {
  sendMapTo: (worldMap, socketId) => {
    World.io.to(socketId).emit('sendMap', generateMapRender(worldMap));
  },

  updateTile: worldTile => {
    World.io.emit('updateTile', generateTileRender(worldTile));
  },
};

module.exports = Vis;
