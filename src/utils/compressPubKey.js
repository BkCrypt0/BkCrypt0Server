const { buildBabyjub } = require("circomlibjs");

async function compressPubKey(uncompressPubkey) {
  const babyJub = await buildBabyjub();
  var compressKey = babyJub.packPoint(uncompressPubkey);
  return compressKey;
}
async function uncompressPubKey(compressPubKey) {
  const babyJub = await buildBabyjub();
  var compressPubKeyBuffer = Buffer.from(compressPubKey, "hex");
  var uncompressPublicKey = babyJub.unpackPoint(compressPubKeyBuffer);
  return uncompressPubKey.map((v) => babyJub.F.toObject(v));
}

module.exports = {
  compressPubKey,
  uncompressPubKey,
};
