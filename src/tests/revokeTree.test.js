const { newLevelDbRevokeTree } = require("../utils/revokeTree");

async function main() {
  var revokeTree = await newLevelDbRevokeTree("example", 20);
  var revokeCache = await newLevelDbRevokeTree("cache", 20);

  // revoke identity
  await revokeCache.revokeId(2);
  await revokeCache.revokeId(3);
  // await revokeCache.unrevokeId(2);
  await revokeCache.revokeId(4);
  console.log(await revokeCache.getIdInfoProof(2))

  console.log(await revokeCache.getIdInfoProof(3))
  console.log(await revokeCache.getIdInfoProof(4))
  console.log(await revokeCache.getIdInfoProof(6))
  console.log(await revokeCache.getIdInfoProof(5))
  console.log(await revokeCache.getIdInfoProof(7))
  console.log(await revokeCache.getIdInfoProof(8))
}


main().then;
