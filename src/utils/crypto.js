const {buildMimc7, buildEddsa} = require("circomlibjs")

async function mimc7() {
  return await buildMimc7();
}

async function eddsa() {
  return await buildEddsa();
}


module.exports = {
  mimc7,
  eddsa
}