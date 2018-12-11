class Visual {
  constructor() {}

  objectToVis(object) {
    return {
      name: object.name,
      char: object.char,
      fgColour: object.fgColour,
      bgColour: object.fgColour,
      x: object.getTile().x,
      y: object.getTile().y,
    };
  }
}

module.exports = Visual;
