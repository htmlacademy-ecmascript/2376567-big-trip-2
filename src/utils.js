const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const returnRandomElem = (array) => array[getRandomInt(0, array.length - 1)];

export {getRandomInt, returnRandomElem};
