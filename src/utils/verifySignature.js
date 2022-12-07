async function verifyClaim(
  publicKey,
  CCCD,
  sex,
  DoBdate,
  BirthPlace,
  signature,
  eddsa
) {
    const mimc = eddsa.mimc7;
    const F = eddsa.F;

    const hash = mimc.multiHash([...publicKey, CCCD, sex,  DoBdate, BirthPlace], 0)
    var sign = {
      R8: [F.e(signature.R8x), F.e(signature.R8y)],
      S: signature.S
    }
    const verify = eddsa.verifyMiMC(hash, sign, [F.e(publicKey[0]), F.e(publicKey[1])])
    return verify;
}

module.exports = {
  verifyClaim
}