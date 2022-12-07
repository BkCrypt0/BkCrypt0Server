import * as mongoose from "mongoose";
import IdentityCard, { IIdentityCard } from "../models/identityCard";
import Issue, {IIssue} from "../models/IssueSchema"
import IdentityMapping, { IIdentityMapping } from "../models/identityMapping";
import { Request, Response } from "express";
import { LevelDB, RevokeDb } from "../../connect";
import { RevokeTree } from "../utils/revokeTree";
import { isUint16Array } from "util/types";

async function getUserInformation(req: Request): Promise<IIssue | null> {
  var publicKeyX = req.query.publicKeyX;
  var publicKeyY = req.query.publicKeyY;
  if (publicKeyX == undefined || publicKeyY == undefined) {
    return null;
  }
  var publicKey = [publicKeyX, publicKeyY];
  const issueFind = await Issue.findOne({claimer: publicKey});
  return issueFind;

}

async function getUserProofMerkleTree(req: Request) {
  var publicKeyX = req.query.publicKeyX;
  var publicKeyY = req.query.publicKeyY;
  if (publicKeyX == undefined || publicKeyY == undefined) {
    return;
  }
  var publicKey = [publicKeyX, publicKeyY];
  var identityCardMapping: IIdentityMapping | null =
    await IdentityMapping.findOne({ publicKey: publicKey });
  if (identityCardMapping == null) {
    throw Error("Not Exist");
  }

  var identityCardId = identityCardMapping.indexCard;
  var identityCard: IIdentityCard | null = await IdentityCard.findOne({
    leafIndex: identityCardId,
  });
  if (identityCard == null) {
    throw Error("Error Identity Card");
  }
  var smtDb = await LevelDB.getInstance();
  var revokeDb: RevokeTree = await RevokeDb.getInstance();
  var leafClaim = await smtDb.getIdInfoProof(identityCard.leafIndex);
  var rootClaim = smtDb.getRoot();
  var leafRevoke = await revokeDb.getIdInfoProof(identityCard.leafIndex);
  var rootRevoke = revokeDb.getRoot();
  var proofData = {
    rootRevoke: smtDb.smt.F.toObject(rootRevoke).toString(),
    siblingsRevoke: leafRevoke.siblings.map((v) => v.toString()),
    oldKeyRevoke: leafRevoke.notFoundKey.toString(),
    oldValueRevoke: leafRevoke.notFoundValue.toString(),
    isOld0Revoke: leafRevoke.isOld0.toString(),
    rootClaims: smtDb.smt.F.toObject(rootClaim).toString(),
    siblingsClaims: leafClaim.siblings.map((v) => v.toString()),
    key: identityCardId,
    value: leafClaim.foundValue.toString(),
  };
  return proofData;
}

export { getUserInformation, getUserProofMerkleTree };
