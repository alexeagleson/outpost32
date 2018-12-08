const WorldObject = require("./../constructors/WorldObject");
const { displayError } = require("./../utility/utility");

const createObject = (type, overwriteName) => {
  let newObject = null;
  switch (type.toLowerCase()) {
    case "player":
      newObject = new WorldObject({
        name: overwriteName || type,
        type: type,
        char: "@"
      });
      newObject.applyMoving();
      return newObject;
    default:
      return displayError(
        "No object with that type.  Make sure switch his using lowercase.",
        type,
        "createObject"
      );
  }
};

module.exports = createObject;
