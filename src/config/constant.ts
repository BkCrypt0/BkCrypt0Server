/**
 * @notice Idenity state
 */
enum IdentityStatus {
  NOT_EXIST = -1,
  REVIEWING = 0,
  APPROVED = 1,
  PUBLISHED = 2,
  REVOKE = 3,
}

const zeroValue = {
  publicKey: ["0", "0"],
  CCCD: "0",
  sex: 0,
  DoBdate: 0,
  BirthPlace: 0,
  hash: "7244400317647726759212845837151908248512761968909835817352420904037607768269",
};

export { IdentityStatus, zeroValue };
