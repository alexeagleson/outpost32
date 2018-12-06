const rollDie = dieSize => Math.floor(Math.random() * dieSize) + 1;

const pickRandom = arrayOfThings => {
  const randomPosition = rollDie(arrayOfThings.length) - 1;
  return arrayOfThings[randomPosition];
};

// randBetween is inclusive of max number
const randBetween = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const displayError = (errorText, argumentName, functionName) => {
  alert(`Error: ${errorText}`);
  console.log(`Error: ${errorText}`);
  console.log(`Argument: ${argumentName}`);
  console.log(`Function: ${functionName}`);
  return null;
};

module.exports = {
  rollDie,
  pickRandom,
  randBetween,
  displayError
};
