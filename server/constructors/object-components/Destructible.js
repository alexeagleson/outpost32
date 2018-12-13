const { normalizeToValue } = require('./../../utility/utility');

class Destructible {
  constructor(worldObject) {
    this.owner = worldObject;
    this.condition = 100;
  }

  processCollision(projectileObject, speed) {
    if (projectileObject.Destructible) projectileObject.Destructible.adjustConditionBy(0 - speed);
    this.adjustConditionBy(0 - speed);
  }

  adjustConditionBy(value) {
    this.condition += value;
    this.condition = normalizeToValue(this.condition, 0, 100);
    this.checkIfDestroyed();
  }

  checkIfDestroyed() {
    if (this.condition <= 0) {
      this.destroy();
      return true;
    }
    return false;
  }

  destroy() {
    this.owner.removeFromUniverse();
  }
}

module.exports = Destructible;