const { newMemEmptyTrie , buildMimc7} = require("circomlibjs");
const { stringifyBigInts, unstringifyBigInts } = require("ffjavascript").utils;
const { hashLeafValue } = require("./claimTreeUtil");

class ClaimMemTree {
  constructor(_memSmt, mimc7, deep) {
    this.memSmt = _memSmt;
    this.inserts = [];
    this.mimc7 = mimc7;
    this.deep = deep;
  }

  async loadInstance(claimTree) {
    var amountLeaf = await claimTree.leafAmount();
    var leafindexs = await claimTree.getLeafIndex();
    for (var i = 0; i < amountLeaf; i++) {
      var tmpData = await claimTree.getIdInfo(leafindexs[i]);
      if (tmpData.found) {
        await this.memSmt.insert(leafindexs[i], tmpData.foundValue);
      }
    }

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
    const resInsert = await this.memSmt.insert(index, resClaim.hash);
    this.inserts.push(index);
    return {
      resInsert,
    };
  }

  async updateId(index, CCCD, sex, DoB, PoB) {
    const resClaim = hashLeafValue(CCCD, sex, DoB, PoB, this.mimc7);
    const resUpdate = await this.memSmt.update(index, resClaim.hash);
    return resUpdate;
  }
  async deleteId(index) {
    await this.memSmt.delete(index);
  }

  async revertTree() {
    // for (var i = 0; i < this.inserts.length; i++) {
    //   this.memSmt.delete(this.inserts[i])
    // }

    this.inserts = new Array(0);
  }

  async syncTree() {
    this.inserts = new Array();
  }

  /**
   * Retrieve leaf information for a given identifier
   * @param {BigInt} CCCD - account identifier
   * @returns {Object} - raw account state
   */
  async getIdInfo(CCCD) {
    const resFind = await this.memSmt.find(CCCD);
    return resFind;
  }

  async getIdInfoProof(CCCD) {
    const resFind = await this.memSmt.find(CCCD);
    var siblingsLeaf = new Array(this.deep).fill(0n);
    for (var i = 0; i < resFind.siblings.length; ++i) {
      siblingsLeaf[i] = this.memSmt.F.toObject(resFind.siblings[i]);
    }
    return {
      found: true,
      siblings: siblingsLeaf,
      foundValue: this.memSmt.F.toObject(resFind.foundValue),
      isOld0: false,
    };
  }

  /**
   * Get rollup merkle tree root
   * @returns {BigInt} - merkle tree root
   */
  getRoot() {
    return this.memSmt.root;
  }
}

async function newClaimMemTree(deep) {
  var mimc7 = await buildMimc7();
  var memSmt = await newMemEmptyTrie();
  var claimMemTree = new ClaimMemTree(memSmt, mimc7, deep);
  return claimMemTree;
}

module.exports = {
  newClaimMemTree,
  ClaimMemTree,
};
