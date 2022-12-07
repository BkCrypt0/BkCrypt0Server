const { buildEddsa, buildMimc7 } = require("circomlibjs");

function generatePrvkey(i) {
  var prvkey = Buffer.from(i.toString().padStart(64, "0"), "hex");
  return prvkey;
}

async function generateData(i, pubkey) {
  var mimc = await buildMimc7();
  var hash = mimc.multiHash([...pubkey, i, 0, 20010201, i], 0);
  return {
    CCCD: i,
    sex: 0,
    DoBdate: 20010201,
    BirthPlace: i,
    hash,
  };
}

async function genInput(
  account_size,
  deadline,
  minAge,
  maxAge,
  currentYear,
  currentMonth,
  currentDay
) {
  const eddsa = await buildEddsa();
  const mimc = await buildMimc7();
  const F = mimc.F;
  var data = [];
  var prvkeys = [];
  var pubkeys = [];
  var signData = [];
  var finalData = [];
  var hashMessage = [];
  for (let i = 0; i < account_size; i++) {
    var prvkeyTmp = generatePrvkey(i);
    var pubkeyTmp = eddsa.prv2pub(prvkeyTmp);
    var dataTmp = await generateData(i, pubkeyTmp);
    var hashTmp = mimc.multiHash([dataTmp.hash, deadline], 0);
    prvkeys.push(prvkeyTmp);
    pubkeys.push(pubkeyTmp);
    data.push(dataTmp);
    hashMessage.push(hashTmp);
    signData.push(eddsa.signMiMC(prvkeyTmp, hashTmp));
  }
  for (let i = 0; i < account_size; i++) {
    var finalDataTmp = {
      publicKey: pubkeys[i].map((v) => F.toObject(v).toString()),
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
      R8x: F.toObject(signData[i].R8[0]).toString(),
      R8y: F.toObject(signData[i].R8[1]).toString(),
      S: signData[i].S.toString(),
      expireTime: deadline,
      message: F.toObject(hashMessage[i]).toString(),
    };
    finalData.push(finalDataTmp);
  }
  return finalData;
}

module.exports = {
  genInput,
  generatePrvkey,
};
