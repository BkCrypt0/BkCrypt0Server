import Issue, { IIssue } from "../models/IssueSchema";
import Publish, { IPublish } from "../models/publishSchema";
import { Request, Response } from "express";
import { LevelDB, RevokeCache, RevokeDb } from "../../connect";
import { IdentityStatus } from "../config/constant";
import { RevokeTree } from "../utils/revokeTree";
import { isAdmin } from "../services/authentication";
import dotenv from "dotenv";
import identityCard, { IIdentityCard } from "../models/identityCard";
import { generateRevokeProofWithRapid } from "../services/js/generateRevokeProofWithRapid";

dotenv.config();

const MAX_REVOKE_DATA = process.env.MAX_REVOKE_DATA || 3;

async function getRevokeIndex(data: any) {
  var listCCCD = await data.CCCDs;

  var indexs = new Array(0);
  if (listCCCD.length > 3) {
    throw Error(`!Limit revoke. Max is ${MAX_REVOKE_DATA}`);
  }
  for (let i = 0; i < listCCCD.length; ++i) {
    var identityCardTmp: IIdentityCard | null = await identityCard.findOne({
      CCCD: listCCCD[i],
    });
    var issueCard: IIssue | null = await Issue.findOne({ CCCD: listCCCD[i] });
    if (identityCardTmp == null) {
      throw Error("Invalid Data");
    }
    if (issueCard == null || issueCard.status != IdentityStatus.PUBLISHED) {
      throw Error(
        `Identity Card ${identityCardTmp.leafIndex} was not published`
      );
    }
    indexs.push(identityCardTmp.leafIndex);
  }

  return indexs;
}

async function getRevokeData(req: Request) {
  var revokeIndexs = await getRevokeIndex(req.body);
  var revokeCache: RevokeTree = await RevokeCache.getInstance();
  var F = revokeCache.smt.F;
  var handlerError: number = 0;

  try {
    var currentRoot = await F.toObject(revokeCache.getRoot()).toString();
    for (let i = 0; i < revokeIndexs.length; ++i) {
      await revokeCache.revokeId(BigInt(revokeIndexs[i]));
      handlerError++;
    }
    var siblings = [];
    var enabled = [];
    var keys = [];
    var values = [];
    var fnc = [];

    for (let i = 0; i < revokeIndexs.length; i++) {
      var leafRevokeTmp = await revokeCache.getIdInfoProof(
        BigInt(revokeIndexs[i])
      );
      var siblingTmp = leafRevokeTmp.siblings.map((v) => v.toString());
      siblings.push(siblingTmp);
      enabled.push(1);
      keys.push(revokeIndexs[i]);
      values.push(0);
      fnc.push(0);
    }

    var input = {
      root: F.toObject(revokeCache.getRoot()).toString(),
      siblings: siblings,
      enabled: enabled,
      keys: keys,
      values: values,
      fnc: fnc,
    };
    var data;

    data = await generateRevokeProofWithRapid(
      input,
      revokeIndexs.length,
      currentRoot
    );
    for (let i = 0; i < revokeIndexs.length; i++) {
      await revokeCache.unrevokeId((revokeIndexs[i]));
    }
    return data;
  } catch (err) {
    for (let i = 0; i < handlerError; i++) {
      await revokeCache.unrevokeId(BigInt(revokeIndexs[i]));
    }
    throw err as Error;
  }
}
async function revoke(req: Request) {
  var dataRaw = req.body;
  var revokeIndexs = await getRevokeIndex(dataRaw);
  var root = await dataRaw.root;
  var revoke: RevokeTree = await RevokeDb.getInstance();
  var cache: RevokeTree = await RevokeCache.getInstance();
  for (let i = 0; i < revokeIndexs.length; i++) {
    await cache.revokeId(revokeIndexs[i]);
    await revoke.revokeId(revokeIndexs[i]);
  }
  for (let i = 0; i < revokeIndexs.length; i++) {
    await Issue.findOneAndUpdate(
      { CCCD: dataRaw.CCCDs[i].toString() },
      { status: IdentityStatus.REVOKE }
    );
  }
}

export { revoke, getRevokeData };
