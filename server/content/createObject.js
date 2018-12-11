const WorldObject = require('./../constructors/WorldObject');
const applyComponent = require('./applyComponent');
const { displayError, pickRandom } = require('./../utility/utility');

const createObject = (type, overwriteName) => {
  let newObject = null;
  switch (type.toLowerCase()) {
    case 'player':
      newObject = new WorldObject({
        name: overwriteName || type,
        type: type,
        char: '@',
        fgColour: pickRandom(['RED', 'YELLOW', 'BLUE', 'GREEN', 'ORANGE']),
      });
      applyComponent(newObject, 'Moving');
      applyComponent(newObject, 'Destructible');
      return newObject;
    case 'rock':
      newObject = new WorldObject({
        name: overwriteName || type,
        type: type,
        char: 'R',
        fgColour: 'GREEN',
      });
      applyComponent(newObject, 'Moving');
      applyComponent(newObject, 'Destructible');
      return newObject;
    default:
      return displayError('No object with that type.  Make sure switch his using lowercase.', type, 'createObject');
  }
};

module.exports = createObject;
