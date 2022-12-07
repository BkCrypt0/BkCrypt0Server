const { execSync } = require("child_process");
const { writeFileSync, readFile, readFileSync, fchown } = require("fs");

require("dotenv").config;
const MAX_REVOKE_DATA = Number(process.env.MAX_REVOKE_DATA) || 3;
const revoke_witness_path_default = "./circuits/revoke/generate_witness.js";
const revokeWasmFileDefault = "./circuits/revoke/updateRootRevoke.wasm";
const revokeZkeyFileDefault = "./circuits/revoke/circuit_final.zkey";
const prepare_proof_default = "./circuits/prepare_proof/";
const output_default = "./circuits/output/"

const zkeyFile = process.env.REVOKE_ZKEY_FILE_PATH || revokeZkeyFileDefault;
const wasmFile = process.env.REVOKE_WASM_FILE_PATH || revokeWasmFileDefault;
const witness_path = process.env.REVOKE_WITNESS_PATH || revoke_witness_path_default;
const prepare_proof = process.env.PREPARE_PROOF_PATH || prepare_proof_default;
const output = process.env.OUTPUT_PATH || output_default;

function execute(StringName) {
  execSync(StringName, { stdio: "inherit", stdin: "inherit" });
}
async function generateRevokeProofWithRapid(input, dataLength, currentRoot) {
  var timestamp = Date.now().toString();
  if (dataLength < MAX_REVOKE_DATA) {
    var provide = MAX_REVOKE_DATA - dataLength;
    for (var i = 0; i < provide; i++) {
      input.siblings.push(input.siblings[dataLength - 1]);
      input.enabled.push(0);
      input.keys.push(0);
      input.values.push(0);
      input.fnc.push(0);
    }
  }
  writeFileSync(
    `${prepare_proof}input-revoke-${timestamp}.json`,
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
    `${prepare_proof}input-revoke-${timestamp}.json` +
    " " +
    `./circuits/witness-revoke-${timestamp}.wtns`
  execute(command);

  // Generate proof
  var commandProve =
    "./rapidsnark/build/prover" +
    " " +
    zkeyFile +
    " " +
    `./circuits/witness-revoke-${timestamp}.wtns` +
    " " +
    `./circuits/output/proof-revoke-${timestamp}.json` +
    " " +
    `./circuits/output/public-revoke-${timestamp}.json`
  execute(commandProve);

  // Return
  var proofdata;
  const file = await readFileSync(`${output}proof-revoke-${timestamp}.json`, (err) => {
    if (err) throw err;
  });
  proofdata = JSON.parse(file);

  var publicSignals;
  const publicFile = readFileSync(
    `${output}public-revoke-${timestamp}.json`,
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
  execute(`rm -rf ./circuits/witness-revoke-${timestamp}.wtns ${output}proof-revoke-${timestamp}.json ${output}public-revoke-${timestamp}.json ${prepare_proof}input-revoke-${timestamp}.json`  )
  return {
    optionName: "VERIFIER_REVOKE_" + MAX_REVOKE_DATA.toString(),
    proof: { pi_a, pi_b, pi_c },
    publicSignals: publicSignals,
    currentRoot: currentRoot,
  };
}

module.exports = {
  generateRevokeProofWithRapid,
};
