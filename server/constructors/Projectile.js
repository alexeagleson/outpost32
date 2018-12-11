const World = require('./../utility/global');
const { directionTo, directionTextToCoords, coordsMatch } = require('./../utility/utility');

class Projectile {
  constructor(config) {
    this.myObject = config.projectileObject;
    this.destinationCoords = config.destinationCoords;
    this.speed = config.speed;
    this.interval = setInterval(() => {
      this.tick();
    }, this.speed);
    World.allProjectiles.push(this);
  }

  tick() {
    const myCoords = this.myObject.getTile().getCoords();
    const relativeMoveCoords = directionTextToCoords(directionTo(myCoords, this.destinationCoords));
    const moveSuccess = this.myObject.Moving.moveRelative(relativeMoveCoords);
    if (!moveSuccess || coordsMatch(this.myObject.getTile().getCoords(), this.destinationCoords)) {
      World.allProjectiles = World.allProjectiles.filter(projectile => projectile !== this);
      clearInterval(this.interval);
    //   this.myObject.removeFromUniverse();
    }
  }
}

module.exports = Projectile;
