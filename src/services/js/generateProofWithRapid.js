const { execSync } = require("child_process");
const { writeFileSync, readFile, readFileSync } = require("fs");
const zeroValue = {
  publicKey: ["0", "0"],
  CCCD: "0",
  sex: 0,
  DoBdate: 0,
  BirthPlace: 0,
  hash: "7244400317647726759212845837151908248512761968909835817352420904037607768269",
};
require("dotenv").config;
const MAX_PUBLISH_DATA = Number(process.env.MAX_PUBLISH_DATA) | 10;
const claim_witness_path_default = "./circuits/claim/generate_witness.js";
const claimWasmFileDefault = "./circuits/claim/updateRootClaim.wasm";
const claimZkeyFileDefault = "./circuits/claim/circuit_final.zkey";
const prepare_proof_default = "./circuits/prepare_proof/";
const output_default = "./circuits/output/"

const zkeyFile = process.env.CLAIM_ZKEY_FILE_PATH || claimZkeyFileDefault;
const wasmFile = process.env.CLAIM_WASM_FILE_PATH || claimWasmFileDefault;
const witness_path = process.env.CLAIM_WITNESS_PATH || claim_witness_path_default;
const prepare_proof = process.env.PREPARE_PROOF_PATH || prepare_proof_default;
const output = process.env.OUTPUT_PATH || output_default;

function execute(StringName) {
  execSync(StringName, { stdio: "inherit", stdin: "inherit" });
}
async function generateClaimProofWithRapid(input, dataLength, currentRoot) {
  var timestamp = Date.now().toString();
  if (dataLength < MAX_PUBLISH_DATA) {
    var provide = MAX_PUBLISH_DATA - dataLength;
    for (var i = 0; i < provide; i++) {
      input.siblings.push(input.siblings[dataLength - 1]);
      input.enabled.push(0);
      input.keys.push(0);
      input.values.push(input.values[dataLength - 1]);
      input.informations.push(input.informations[dataLength - 1]
      );
      input.signatures.push(input.signatures[dataLength - 1]);
    }
  }
  writeFileSync(
    `${prepare_proof}input-claim-${timestamp}.json`,
    JSON.stringify(input),
    (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("write successful");
      }
    }
  );
  // Generate witness
  var command =
    "node" +
    " " +
    witness_path +
    " " +
    wasmFile +
    " " +
    `${prepare_proof}input-claim-${timestamp}.json` +
    " " +
    `./circuits/witness-claim-${timestamp}.wtns`;
  execute(command);

  // Generate proof
  var commandProve =
    "./rapidsnark/build/prover" +
    " " +
    zkeyFile +
    " " +
    `./circuits/witness-claim-${timestamp}.wtns` +
    " " +
    `./circuits/output/proof-claim-${timestamp}.json` +
    " " +
    `./circuits/output/public-claim-${timestamp}.json`;
  execute(commandProve);

  // Return
  var proofdata;
  const file = await readFileSync(`${output}proof-claim-${timestamp}.json`, (err) => {
    if (err) throw err;
  });
  proofdata = JSON.parse(file);

  var publicSignals;
  const publicFile = readFileSync(
    `${output}public-claim-${timestamp}.json`,
    (err, data) => {
      if (err) throw err;
    }
  );
  publicSignals = JSON.parse(publicFile);

  const pi_a = [proofdata.pi_a[0], proofdata.pi_a[1]];
  const pi_b = [
    [proofdata.pi_b[0][1], proofdata.pi_b[0][0]],
    [proofdata.pi_b[1][1], proofdata.pi_b[1][0]],
  ];
  const pi_c = [proofdata.pi_c[0], proofdata.pi_c[1]];
  execute(`rm -rf ./circuits/witness-claim-${timestamp}.wtns ${output}proof-claim-${timestamp}.json ${output}public-claim-${timestamp}.json ${prepare_proof}input-claim-${timestamp}.json`  )
  return {
    optionName: "VERIFIER_CLAIM_" + MAX_PUBLISH_DATA.toString(),
    proof: { pi_a, pi_b, pi_c },
    publicSignals: publicSignals,
    currentRoot: currentRoot,
  };
}

module.exports = {
  generateClaimProofWithRapid,
};
