const { buildEddsa, buildBabyjub } = require("circomlibjs");
const bip39 = require("bip39");

var HDKey = require("hdkey");
const rootPath = "m/44'/60'/0'/0/0";
const randMnemonic = bip39.generateMnemonic();
const hdkey = HDKey.fromMasterSeed(randMnemonic);
const prvKey = hdkey.privateKey;

async function main() {
  const eddsa = await buildEddsa();
  for (let i = 0; i < 10; i++) {
    var tmpPrvkey = Buffer.from(i.toString().padStart(64, "0"), "hex");
    var tmpPubkey = eddsa.prv2pub(tmpPrvkey);
    console.log(`key pair ${i}`);
    console.log("prv: ", tmpPrvkey.toString("hex"));
    console.log(
      "pub: ",
      tmpPubkey.map((v) => eddsa.F.toObject(v).toString())
    );
  }
}

main().then;
