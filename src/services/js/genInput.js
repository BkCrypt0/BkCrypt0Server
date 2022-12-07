exports.getTree = exports.numToHex = exports.hash = exports.generateLeaf = void 0;
const { ethers } = require("hardhat");
const fs = require("fs");
const { buildPedersenHash, buildBabyjub } = require("circomlibjs");
const { toBufferLE, toBigIntLE, toBigIntBE } = require("bigint-buffer");
const MerkleTree = require("fixed-merkle-tree");
const { randomBytes } = require("crypto");
const BN = require("bn.js");
let pedersen;
let babyJub;
let F;
let tree;

const initialize = async () => {
  pedersen = await buildPedersenHash();
  babyJub = await buildBabyjub();
  F = babyJub.F;
  tree = new MerkleTree(32);
}

const getTree = () => {
  return tree;
}
exports.getTree = getTree;

function numToHex(num, n = 32) {
  return ethers.utils.hexZeroPad(ethers.BigNumber.from(num).toHexString(), n);
}
exports.numToHex = numToHex;

function hash(msg) {
  return F.toObject(babyJub.unpackPoint(pedersen.hash(msg))[0]);
}
exports.hash = hash;

function randomBigInt(n) {
  return toBigIntLE(randomBytes(n));
}

function leafHasher(cccd, sex, DoBdate, BirthPlace) {

  const leafImage = Buffer.concat([
    toBufferLE(cccd, 5),
    toBufferLE(sex, 1),
    toBufferLE(DoBdate, 8),
    toBufferLE(BirthPlace, 8),
  ]);

  const leaf = hash(leafImage);
  return leaf;
}
exports.leafHasher = leafHasher;

const addLeaf = async (cccd, sex, DoBdate, BirthPlace) => {
  if (!tree) await initialize();
  const leaf = leafHasher(cccd, sex, DoBdate, BirthPlace);
  tree.insert(leaf);
  return tree._layers[0].length - 1;
}
exports.addLeaf = addLeaf;
/*

 */
const genAgeInput = (publicKey, cccd, sex, DoBdate, BirthPlace, minAge, maxAge, index) => {

  const leaf = leafHasher(cccd, sex, DoBdate, BirthPlace);

  let dateObj = new Date();
  let month = dateObj.getUTCMonth() + 1; //months from 1-12
  let day = dateObj.getUTCDate();
  let year = dateObj.getUTCFullYear();



  // console.log(hash(toBufferLE(leaf.publicKey, 20)))

  const { pathElements, pathIndices } = tree.path(index);
  const input = {
    root: tree.root(),
    leaf: numToHex(leaf),
    publicKey: numToHex(publicKey),
    CCCD: Number(cccd),
    sex: Number(sex),
    DoBdate: Number(DoBdate),
    BirthPlace: Number(BirthPlace),

    minAge: minAge,
    maxAge: maxAge,
    challenge: 100,
    currentYear: year,
    currentMonth: month,
    currentDay: day,
    pathElements: pathElements.map(e => e.toString()),
    pathIndices: pathIndices,
  };

  return input;
}
exports.genAgeInput = genAgeInput;

const genPlaceInput = (publicKey, cccd, sex, DoBdate, BirthPlace, placesExpecting, index) => {
  const leaf = leafHasher(cccd, sex, DoBdate, BirthPlace);
  const { pathElements, pathIndices } = tree.path(index);
  const input = {
    root: tree.root(),
    leaf: numToHex(leaf),
    publicKey: numToHex(publicKey),
    CCCD: Number(cccd),
    sex: Number(sex),
    DoBdate: Number(DoBdate),
    BirthPlace: Number(BirthPlace),

    placesExpecting: numToHex(placesExpecting, 8),
    challenge: 100,
    pathElements: pathElements.map(e => e.toString()),
    pathIndices: pathIndices,
  };

  return input;
}
exports.genPlaceInput = genPlaceInput;