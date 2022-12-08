import Issue, { IIssue } from "../models/IssueSchema";
import Publish, { IPublish } from "../models/publishSchema";
import { Request, Response } from "express";
import { LevelDB, RevokeCache, RevokeDb } from "../../connect";
import { IdentityStatus } from "../config/constant";
import { RevokeTree } from "../utils/revokeTree";
import { isAdmin } from "../services/authentication";
import dotenv from "dotenv";
import identityCard, { IIdentityCard } from "../models/identityCard";
import { generateUnRevokeProofWithRapid } from "../services/js/generateUnrevokeProofWithRapid";

dotenv.config();

const MAX_REVOKE_DATA = process.env.MAX_REVOKE_DATA || 3;

async function getUnRevokeIndex(data: any) {
  var listCCCD = await data.CCCDs;

  var indexs = new Array(0);
  if (listCCCD.length > 3) {
    throw Error(`!Limit unrevoke. Max is ${MAX_REVOKE_DATA}`);
  }
  for (let i = 0; i < listCCCD.length; ++i) {
    var identityCardTmp: IIdentityCard | null = await identityCard.findOne({
      CCCD: listCCCD[i],
    });
    var issueCard: IIssue | null = await Issue.findOne({ CCCD: listCCCD[i] });
    if (identityCardTmp == null) {
      throw Error("Invalid Data");
    }
    if (issueCard == null || issueCard.status != IdentityStatus.REVOKE) {
      throw Error(`Identity Card ${identityCardTmp.leafIndex} was not revoked`);
    }
    indexs.push(identityCardTmp.leafIndex);
  }

  return indexs;
}

async function getUnRevokeData(req: Request) {
  var revokeIndexs = await getUnRevokeIndex(req.body);
  var revokeCache: RevokeTree = await RevokeCache.getInstance();
  var F = revokeCache.smt.F;
  var handlerError: number = 0;

  try {
    var currentRoot = await F.toObject(revokeCache.getRoot()).toString();
    for (let i = 0; i < revokeIndexs.length; ++i) {
      await revokeCache.unrevokeId(revokeIndexs[i]);
      handlerError++;
    }
    var siblings = [];
    var oldKey = [];
    var oldValue = [];
    var isOld0 = [];
    var keys = [];
    var values = [];

    for (let i = 0; i < revokeIndexs.length; i++) {
      var leafRevokeTmp = await revokeCache.getIdInfoProof(revokeIndexs[i]);
      var siblingTmp = leafRevokeTmp.siblings.map((v) => v.toString());
      siblings.push(siblingTmp);
      oldKey.push(leafRevokeTmp.notFoundKey.toString());
      oldValue.push(leafRevokeTmp.notFoundValue.toString());
      isOld0.push(leafRevokeTmp.isOld0.toString());
      keys.push(revokeIndexs[i]);
    }

    var input = {
      root: F.toObject(revokeCache.getRoot()).toString(),
      siblings: siblings[0],
      oldKey: oldKey[0],
      oldValue: oldValue[0],
      isOld0: isOld0[0],
      key: keys[0],
    };
    var data;
    data = await generateUnRevokeProofWithRapid(
      input,
      revokeIndexs.length,
      currentRoot
    );
    for (let i = 0; i < revokeIndexs.length; i++) {
      await revokeCache.revokeId(revokeIndexs[i]);
      console.log(await revokeCache.getIdInfo(revokeIndexs[i]));
    }
    return data;
  } catch (err) {
    for (let i = 0; i < handlerError; i++) {
      await revokeCache.revokeId(revokeIndexs[i]);
    }
    throw err as Error;
  }
}
async function unrevoke(req: Request) {
  var dataRaw = req.body;
  var revokeIndexs = await getUnRevokeIndex(dataRaw);
  var root = await dataRaw.root;
  var revoke: RevokeTree = await RevokeDb.getInstance();
  var cache: RevokeTree = await RevokeCache.getInstance();
  var F = revoke.smt.F;
  for (let i = 0; i < revokeIndexs.length; i++) {
    await cache.unrevokeId(revokeIndexs[i]);
  }
  if (root != F.toObject(cache.getRoot()).toString()) {
    for (let i = 0; i < revokeIndexs.length; i++) {
      await cache.revokeId(revokeIndexs[i]);
    }
    throw Error("Invalid data cache");
  }
  for (let i = 0; i < revokeIndexs.length; i++) {
    await revoke.unrevokeId(revokeIndexs[i]);
  }

  if (root != F.toObject(revoke.getRoot()).toString()) {
    for (let i = 0; i < revokeIndexs.length; i++) {
      await revoke.revokeId(revokeIndexs[i]);
    }
    throw Error("Invalid data revoke");
  }

  for (let i = 0; i < revokeIndexs.length; i++) {
    await Issue.findOneAndUpdate(
      { CCCD: dataRaw.CCCDs[i].toString() },
      { status: IdentityStatus.PUBLISHED }
    );
  }
}

export { getUnRevokeData, unrevoke };
