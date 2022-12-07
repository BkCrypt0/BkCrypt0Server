const { buildMimc7 } = require("circomlibjs");
const { stringifyBigInts, unstringifyBigInts } = require("ffjavascript").utils;
const { hashLeafValue } = require("./claimTreeUtil");
const { newLevelDbEmptyTree } = require("./smt-leveldb");
const { Level } = require("level");

class ClaimTree {
  constructor(_leafDb, _smt, _deep, _mimc7) {
    this.leafDb = _leafDb;
    this.smt = _smt;
    this.deep = _deep;
    this.mimc7 = _mimc7;
  }

  async leafAmount() {
     return await this.leafDb.get('amount');
  }

  async getLeafIndex() {
    return await this.leafDb.get('idx');
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
   * @param {BigInt} index - claim tree identifier
   * @param {BigInt} CCCD - CCCD of identity card
   * @param {String} name - Full Name of User
   * @param {BigInt} DoB - Date of Birth YYYYXXDD
   * @param {BigInt} PoB - Place of Birth
   */

  async addId(index, publicKey, CCCD, sex, DoB, PoB) {
    const resClaim = hashLeafValue(CCCD, publicKey, sex, DoB, PoB, this.mimc7);
    var amount = await this.leafDb.get("amount");
    var idxs = await this.leafDb.get('idx');
    idxs.push(Number(index))
    await this.leafDb.put("amount", amount + 1);
    await this.leafDb.put(resClaim.hash, this._toString(resClaim.leafObject));
    await this.leafDb.put('idx',idxs);
    const leafRaw = resClaim.leafObject;
    const resInsert = await this.smt.insert(index, resClaim.hash);
    return {
      resInsert,
      leafRaw,
    };
  }

  async updateId(index, CCCD, sex, DoB, PoB) {
    const resClaim = hashLeafValue(CCCD, sex, DoB, PoB, this.mimc7);
    await this.leafDb.put(resClaim.hash, this._toString(resClaim.leafObject));
    const resUpdate = await this.smt.update(index, resClaim.hash);
    return resUpdate;
  }
  async deleteId(index) {
    var amount = await this.leafAmount();
    await this.leafDb.put("amount", amount - 1);
    await this.smt.delete(index);
  }

  /**
   * Retrieve leaf information for a given identifier
   * @param {BigInt} idx - account identifier
   * @returns {Object} - raw account state
   */
  async getIdInfo(idx) {
    const resFind = await this.smt.find(idx);
    if (resFind.found) {
      resFind.foundObject = this._fromString(
        await this.leafDb.get(resFind.foundValue)
      );
    }
    return resFind;
  }

  async getIdInfoProof(idx) {
    const resFind = await this.smt.find(idx);
    if (resFind.found) {
      resFind.foundObject = this._fromString(
        await this.leafDb.get(resFind.foundValue)
      );
    }
    var siblingsLeaf = new Array(this.deep).fill(0n);
    for (var i = 0; i < resFind.siblings.length; ++i) {
      siblingsLeaf[i] = this.smt.F.toObject(resFind.siblings[i]);
    }
    return {
      found: resFind.found,
      siblings: siblingsLeaf,
      foundValue: this.smt.F.toObject(resFind.foundValue),
      isOld0: false,
      foundObject: resFind.foundObject,
    };
  }

  /**
   * Get rollup merkle tree root
   * @returns {BigInt} - merkle tree root
   */
  getRoot() {
    return this.smt.root;
  }
}

async function newLevelDbClaimTree(path, deep) {
  const mimc7 = await buildMimc7();
  const lastTreeDb = new Level(`${path}-leafs`, {valueEncoding: 'json'});
  var errDb;
  try {
    await lastTreeDb.get('amount');
  } catch (err) {
    errDb = err
  }

  if (errDb != null) {
    lastTreeDb.put('amount', 0);
    lastTreeDb.put('idx', []);
  }

  const smt = await newLevelDbEmptyTree(`${path}-tree`);
  const claimTree = new ClaimTree(lastTreeDb, smt, deep, mimc7);
  return claimTree;
}

module.exports = {
  ClaimTree,
  newLevelDbClaimTree,
};
