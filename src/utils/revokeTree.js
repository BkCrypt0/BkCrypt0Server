const { stringifyBigInts, unstringifyBigInts } = require("ffjavascript").utils;
const { newLevelDbEmptyTree } = require("./smt-leveldb");
const { Level } = require("level");

class RevokeTree {
  constructor(_smt, _deep) {
    this.smt = _smt;
    this.deep = _deep;
  }

  /**
   * Convert to string
   * normally used in order to add it to database
   * @param {Any} - any input parameter
   * @returns {String}
   */
  _toString(val) {
    return JSON.stringify(stringifyBigInts(val));
  }

  /**
   * Get from string
   * normally used ti get from database
   * @param {String} - string to parse
   * @returns {Any}
   */
  _fromString(val) {
    return unstringifyBigInts(JSON.parse(val));
  }

  /**
   * @param {BigInt} CCCD - CCCD of identity card
   * @param {String} name - Full Name of User
   * @param {BigInt} DoB - Date of Birth YYYYXXDD
   * @param {BigInt} PoB - Place of Birth
   */

  async revokeId(CCCD) {
    const resInsert = await this.smt.insert(CCCD, 0);
    return resInsert;
  }

  async unrevokeId(CCCD) {
    const resUpdate = await this.smt.delete(CCCD);
  }

  /**
   * Retrieve leaf information for a given identifier
   * @param {BigInt} CCCD - account identifier
   * @returns {Object} - raw account state
   */
  async getIdInfo(CCCD) {
    const resFind = await this.smt.find(CCCD);
    return resFind;
  }

  async getIdInfoProof(CCCD) {
    const resFind = await this.smt.find(CCCD);
    var siblingsLeaf = new Array(this.deep).fill(0n);
    for (var i = 0; i < resFind.siblings.length; ++i) {
      siblingsLeaf[i] = this.smt.F.toObject(resFind.siblings[i]);
    }
    var data = {
      found: resFind.found,
      siblings: siblingsLeaf,
      foundValue: resFind.foundValue,
      isOld0: resFind.isOld0 ? 1n : 0n,
      foundObject: resFind.foundObject,
      notFoundKey: resFind.isOld0
        ? 0n
        : this.smt.F.toObject(resFind.notFoundKey),
      notFoundValue: resFind.isOld0
        ? 0n
        : this.smt.F.toObject(resFind.notFoundValue),
    };
    return data;
  }

  /**
   * Get rollup merkle tree root
   * @returns {BigInt} - merkle tree root
   */
  getRoot() {
    return this.smt.root;
  }
}

async function newLevelDbRevokeTree(path, deep) {
  const smt = await newLevelDbEmptyTree(`${path}-tree`);
  const revokeTree = new RevokeTree(smt, deep);
  return revokeTree;
}

module.exports = {
  RevokeTree,
  newLevelDbRevokeTree,
};
