const {
  padZeroes,
  buildElement,
  arrayBigIntToArrayStr,
  hashBuffer,
  num2Buff,
  timeout,
  arrayHexToBigInt,
} = require("./utils");

/**
 *
 * @param {*} CCCD  - 4 byte
 * @param {*} sex - 1 byte
 * @param {*} DoB - 4 byte
 * @param {*} PoB - 1 byte
 */
function hashLeafValue(CCCD, publicKey, sex, DoB, PoB, hash) {
  //Build Entry

  const leafObject = {
    publicKey,
    CCCD,
    sex,
    DoB,
    PoB,
  };

  return {
    leafObject,
    hash: hash.multiHash([...publicKey, CCCD, sex, DoB, PoB], 0),
  };
}

module.exports = {
  hashLeafValue,
};
