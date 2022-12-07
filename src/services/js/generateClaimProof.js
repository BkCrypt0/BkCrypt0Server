const snarkjs = require("snarkjs");
require("dotenv").config;

const wasmFileDefault = "./circuits/updateRootClaim.wasm";
const zkeyFileDefault = "./circuits/circuit_final.zkey";
const zkeyFile =  process.env.ZKEY_FILE_URL || zkeyFileDefault;
const wasmFile =  process.env.WASM_FILE_URL || wasmFileDefault
const MAX_PUBLISH_DATA = Number(process.env.MAX_PUBLISH_DATA) | 50;
const {zeroValue} = require()

async function generateClaimProof(input, dataLength) {
  if (dataLength < MAX_PUBLISH_DATA) {
    var provide = MAX_PUBLISH_DATA - dataLength;
    for (var i = 0; i < provide; i++) {
      input.siblings.push(input.siblings[dataLength - 1]);
      input.enabled.push(0);
      input.keys.push(0);
      input.values.push(input.values[dataLength - 1]);
      input.informations.push(input.informations[dataLength - 1]);
      input.signatures.push(input.signatures[dataLength - 1]);
    }
  }
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    wasmFile,
    zkeyFile
  );
  const pi_a = [proof.pi_a[0], proof.pi_a[1]];
  const pi_b = [
    [proof.pi_b[0][1], proof.pi_b[0][0]],
    [proof.pi_b[1][1], proof.pi_b[1][0]],
  ];
  const pi_c = [proof.pi_c[0], proof.pi_c[1]];
  // var verify = await snarkjs.groth16.verify(vkeyFile, publicSignals, proof);
  return { proof: { pi_a, pi_b, pi_c }, publicSignals };
}

module.exports = {
  generateClaimProof,
};
