const { buildPoseidon } = require("circomlibjs");

async function hash(inputs) {
  const poseidon = await buildPoseidon();
  const F = poseidon.F;
  return F.toObject(poseidon(inputs)).toString();
}

module.exports = {
  hash,
};
