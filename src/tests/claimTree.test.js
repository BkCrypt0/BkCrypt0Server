const { newLevelDbClaimTree } = require("../utils/claimTree");
const {newClaimMemTree} = require('../utils/claimMemTree')
const { buildEddsa, buildPoseidon,newMemEmptyTrie } = require("circomlibjs");
const {Level} = require('level');

async function main() {

  var claimTree = await newLevelDbClaimTree("example");
  // var claimMemTree = await newMemEmptyTrie();
  const F = claimTree.smt.F;
  // await claimTree.addId(2,[1,1], 1,1,1,1);
  // await claimTree.addId(3,[1,1], 1,1,1,1);
  console.log("test", await claimTree.getIdInfo(2));
  data = await claimTree.getLeafIndex();
  console.log(data)

  var claimMemTree = await newClaimMemTree(); 
  await claimMemTree.loadInstance(claimTree);
  console.log("data", await claimMemTree.getIdInfo(2));
  // for (let i = 0; i < 4; ++i) {
  //     var res = await claimTree.addId(i, 0, 10 + i, 20010201, 38);
  //     console.log(`data ${i}: `)
  //     console.log("old Key: ", F.toObject(res.oldKey));
  //     console.log("old Value", F.toObject(res.oldValue));
  //     console.log("new Key", F.toObject(res.newKey));
  //     console.log("new Value", F.toObject(res.newValue));
  // }
  // console.log("===========================================")
  // for (let i = 0; i < 4; ++i) {
  //     var res = await claimTree.updateId(i, 0, 10 + i + 1, 20010201, 38);
  //     console.log(`data ${i}: `)
  //     console.log("old Key: ", F.toObject(res.oldKey));
  //     console.log("old Value", F.toObject(res.oldValue));
  //     console.log("new Key", F.toObject(res.newKey));
  //     console.log("new Value", F.toObject(res.newValue));
  // }
  // console.log("================================")
  // for (let i = 0; i < 4; ++i) {
  //     var root = claimTree.getRoot();
  //     var dataTmp = await claimTree.getIdInfo(i);
  //     console.log(`data ${i}`);
  //     console.log(dataTmp)
  // }

}

main().then;
