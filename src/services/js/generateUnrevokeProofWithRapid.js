const { execSync } = require("child_process");
const { writeFileSync, readFile, readFileSync, fchown } = require("fs");

require("dotenv").config;
const MAX_UNREVOKE_DATA = Number(process.env.MAX_UNREVOKE_DATA) || 3;
const unrevoke_witness_path_default = "./circuits/unrevoke/generate_witness.js";
const unrevokeWasmFileDefault = "./circuits/unrevoke/updateRootUnrevoke.wasm";
const unrevokeZkeyFileDefault = "./circuits/unrevoke/circuit_final.zkey";
const prepare_proof_default = "./circuits/prepare_proof/";
const output_default = "./circuits/output/"

const zkeyFile = process.env.UNREVOKE_ZKEY_FILE_PATH || unrevokeZkeyFileDefault;
const wasmFile = process.env.UNREVOKE_WASM_FILE_PATH || unrevokeWasmFileDefault;
const witness_path = process.env.UNREVOKE_WITNESS_PATH || unrevoke_witness_path_default;
const prepare_proof = process.env.PREPARE_PROOF_PATH || prepare_proof_default;
const output = process.env.OUTPUT_PATH || output_default;

function execute(StringName) {
  execSync(StringName, { stdio: "inherit", stdin: "inherit" });
}
async function generateUnRevokeProofWithRapid(input, dataLength, currentRoot) {
  var timestamp = Date.now().toString();
  console.log(input)
  console.log(currentRoot)
  writeFileSync(
    `${prepare_proof}input-unrevoke-${timestamp}.json`,
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
    `${prepare_proof}input-unrevoke-${timestamp}.json` +
    " " +
    `./circuits/witness-unrevoke-${timestamp}.wtns`
  execute(command);

  // Generate proof
  var commandProve =
    "./rapidsnark/build/prover" +
    " " +
    zkeyFile +
    " " +
    `./circuits/witness-unrevoke-${timestamp}.wtns` +
    " " +
    `./circuits/output/proof-unrevoke-${timestamp}.json` +
    " " +
    `./circuits/output/public-unrevoke-${timestamp}.json`
  execute(commandProve);

  // Return
  var proofdata;
  const file = await readFileSync(`${output}proof-unrevoke-${timestamp}.json`, (err) => {
    if (err) throw err;
  });
  proofdata = JSON.parse(file);

  var publicSignals;
  const publicFile = readFileSync(
    `${output}public-unrevoke-${timestamp}.json`,
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
  execute(`rm -rf ./circuits/witness-unrevoke-${timestamp}.wtns ${output}proof-unrevoke-${timestamp}.json ${output}public-unrevoke-${timestamp}.json ${prepare_proof}input-unrevoke-${timestamp}.json`  )
  return {
    optionName: "VERIFIER_UNREVOKE",
    proof: { pi_a, pi_b, pi_c },
    publicSignals: publicSignals,
    currentRoot: currentRoot,
  };
}

module.exports = {
  generateUnRevokeProofWithRapid,
};
