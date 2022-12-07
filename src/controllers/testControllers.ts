import { Request } from "express";
import { TestLevelDB, TestRevokeDb } from "../../connect";
import { genInput } from "../services/js/notRevokeData";

function generatePrvkey(i: Number): Buffer {
  var prvkey = Buffer.from(i.toString().padStart(64, "0"), "hex");
  return prvkey;
}

async function notRevoke(req: Request) {
  var account_size = req.body.amount;
  var deadline = req.body.deadline;
  var minAge = req.body.minAge;
  var maxAge = req.body.maxAge;
  var currentYear = req.body.currentYear;
  var currentMonth = req.body.currentMonth;
  var currentDay = req.body.currentDay;

  var data = await genInput(
    account_size,
    deadline,
    minAge,
    maxAge,
    currentYear,
    currentMonth,
    currentDay
  );
  var testRevokeTree = await TestRevokeDb.getInstance();
  var testSMTTree = await TestLevelDB.getInstance();
  for (let i = 0; i < account_size; i++) {
    await testSMTTree.addId(
      BigInt(i),
      data[i].publicKey,
      BigInt(data[i].CCCD),
      BigInt(data[i].sex),
      BigInt(data[i].DoBdate),
      BigInt(data[i].BirthPlace)
    );
  }

  var proofData = new Array(account_size);

  for (let i = 0; i < account_size; i++) {
    var leafClaim = await testSMTTree.getIdInfoProof(i);
    var rootClaim = testSMTTree.getRoot();
    var leafRevoke = await testRevokeTree.getIdInfoProof(i);
    var rootRevoke = testRevokeTree.getRoot();
    var proofDataTmp = {
      rootRevoke: testSMTTree.smt.F.toObject(rootRevoke).toString(),
      siblingsRevoke: leafRevoke.siblings.map((v) => v.toString()),
      oldKeyRevoke: leafRevoke.notFoundKey.toString(),
      oldValueRevoke: leafRevoke.notFoundValue.toString(),
      isOld0Revoke: leafRevoke.isOld0,
      rootClaims: testSMTTree.smt.F.toObject(rootClaim).toString(),
      siblingsClaims: leafClaim.siblings.map((v) => v.toString()),
      key: i,
      value: leafClaim.foundValue.toString(),
      publicKey: data[i].publicKey,
      CCCD: data[i].CCCD,
      sex: data[i].sex,
      DoBdate: data[i].DoBdate,
      BirthPlace: data[i].BirthPlace,
      minAge: minAge,
      maxAge: maxAge,
      challange: 100,
      currentYear: currentYear,
      currentMonth: currentMonth,
      currentDay: currentDay,
      R8x: data[i].R8x,
      R8y: data[i].R8y,
      S: data[i].S,
      expireTime: deadline,
      message: data[i].message,
    };
    proofData[i] = proofDataTmp;
  }
  for (let i = 0; i < account_size; i++) {
    await testSMTTree.deleteId(BigInt(i));
  }
  return proofData;
}

async function testrevoke(req: Request) {
  var account_size = req.body.amount;
  var deadline = req.body.deadline;
  var minAge = req.body.minAge;
  var maxAge = req.body.maxAge;
  var revokeAccount = req.body.revokeAccount;
  var data = await genInput(account_size, deadline, minAge, maxAge);
  var testRevokeTree = await TestRevokeDb.getInstance();
  var testSMTTree = await TestLevelDB.getInstance();
  for (let i = 0; i < account_size; i++) {
    await testSMTTree.addId(
      BigInt(i),
      data[i].publicKey,
      BigInt(data[i].CCCD),
      BigInt(data[i].sex),
      BigInt(data[i].DoBdate),
      BigInt(data[i].BirthPlace)
    );
  }
  for (let i = 0; i < revokeAccount.length; i++) {
    await testRevokeTree.revokeId(revokeAccount[i]);
  }

  var proofData = new Array(account_size);

  for (let i = 0; i < account_size; i++) {
    var leafClaim = await testSMTTree.getIdInfoProof(i);
    var rootClaim = testSMTTree.getRoot();
    var leafRevoke = await testRevokeTree.getIdInfoProof(i);
    var rootRevoke = testRevokeTree.getRoot();
    var proofDataTmp = {
      rootRevoke: testSMTTree.smt.F.toObject(rootRevoke).toString(),
      siblingsRevoke: leafRevoke.siblings.map((v) => v.toString()),
      oldKeyRevoke: leafRevoke.notFoundKey.toString(),
      oldValueRevoke: leafRevoke.notFoundValue.toString(),
      isOld0: leafRevoke.isOld0,
      rootClaims: testSMTTree.smt.F.toObject(rootClaim).toString(),
      siblingsClaims: leafClaim.siblings.map((v) => v.toString()),
      key: i,
      value: leafClaim.foundValue.toString(),
      publicKey: data[i].publicKey,
      CCCD: data[i].CCCD,
      sex: data[i].sex,
      DoBdate: data[i].DoBdate,
      BirthPlace: data[i].BirthPlace,
      minAge: minAge,
      maxAge: maxAge,
      challange: 100,
      currentYear: 2022,
      currentMonth: 11,
      currentDay: 14,
      R8x: data[i].R8x,
      R8y: data[i].R8y,
      S: data[i].S,
      expireTime: deadline,
      message: data[i].message,
    };
    proofData[i] = proofDataTmp;
  }
  for (let i = 0; i < account_size; i++) {
    await testSMTTree.deleteId(BigInt(i));
  }
  for (let i = 0; i < revokeAccount.length; i++) {
    await testRevokeTree.unrevokeId(BigInt(revokeAccount[i]));
  }
  return proofData;
}
export { notRevoke, testrevoke };
