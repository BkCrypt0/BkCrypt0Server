import * as mongoose from "mongoose";
import Issue, { IIssue } from "../models/IssueSchema";
import Publish, { IPublish } from "../models/publishSchema";
import IdentityCard from "../models/identityCard";
import { Request, Response } from "express";
import { LevelDB, ClaimTreeCache, CacheDB } from "../../connect";
import { ClaimTree } from "../utils/claimTree";
import { IdentityStatus } from "../config/constant";
import IdentityMapping from "../models/identityMapping";
import Claim, { IClaim } from "../models/claim";
import { generateClaimProof } from "../services/js/generateClaimProof";
import { signatureToArray } from "../utils/objectToArray";
import { ClaimMemTree } from "../utils/claimMemTree";
import { generateClaimProofWithRapid } from "../services/js/generateProofWithRapid";
import * as dotenv from "dotenv";
dotenv.config();

async function getUnpublished() {
  var max_publish_data = Number(process.env.MAX_PUBLISH_DATA) || 50;
  var unpublishedData = await Claim.find({ isPublish: false }).limit(
    max_publish_data
  );
  return unpublishedData;
}

async function getAllPublished(): Promise<IPublish[]> {
  var publishData = await Publish.find({});
  return publishData;
}

async function getPublishIndex(): Promise<number> {
  return await Publish.count({});
}

async function getPublishData(publishIndexs: Number[]): Promise<IClaim[]> {
  var publishData = new Array<IClaim>(publishIndexs.length);
  for (let i = 0; i < publishIndexs.length; i++) {
    var publishTmp = await Claim.findOne({ CCCD: publishIndexs[i] });
    if (publishTmp != null) {
      publishData[i] = publishTmp;
    }
  }

  return publishData;
}
async function getPublishDataProof(req: Request) {
  //
  var smtCache: ClaimTree = await CacheDB.getInstance();
  var publishIndex: Array<Number> = [];
  var signatures = [];
  var cards = [];
  const F = smtCache.smt.F;
  var currentRoot = F.toObject(smtCache.getRoot()).toString();
  var unpublishedData = await getUnpublished();
  var amountDataPublish = await unpublishedData.length;
  if (amountDataPublish == 0) {
    throw Error("Not data to publish");
  }
  var length = await getPublishIndex();
  var handleError: number = 0;

  try {
    for (let i = 0; i < unpublishedData.length; i++) {
      var unpublishedTmp: IClaim = unpublishedData[i];
      signatures.push(signatureToArray(unpublishedTmp.signature));
      let resInsert = await smtCache.addId(
        BigInt(length + i),
        unpublishedTmp.publicKey,
        BigInt(unpublishedTmp.CCCD),
        BigInt(unpublishedTmp.sex),
        BigInt(unpublishedTmp.DoBdate),
        BigInt(unpublishedTmp.BirthPlace)
      );
      cards.push({
        publicKey: unpublishedTmp.publicKey,
        CCCD: unpublishedTmp.CCCD,
        sex: unpublishedTmp.sex,
        DoBdate: unpublishedTmp.DoBdate,
        BirthPlace: unpublishedTmp.BirthPlace,
      });
      publishIndex.push(length + i);
      handleError++;
    }
    // Input for proof
    var siblings = [];
    var enabled = [];
    var values = [];
    var informations = [];
    for (let i = 0; i < publishIndex.length; i++) {
      var leafInfoTmp = await smtCache.getIdInfoProof(publishIndex[i]);
      var publicKey = cards[i].publicKey;
      var CCCD = cards[i].CCCD.toString();
      var sex = cards[i].sex.toString();
      var DoBdate = cards[i].DoBdate.toString();
      var BirthPlace = cards[i].BirthPlace.toString();
      siblings.push(leafInfoTmp.siblings.map((v) => v.toString()));
      enabled.push(1);
      values.push(leafInfoTmp.foundValue.toString());
      informations.push([
        publicKey[0].toString(),
        publicKey[1].toString(),
        CCCD,
        sex,
        DoBdate,
        BirthPlace,
      ]);
    }
    var input = {
      root: F.toObject(smtCache.getRoot()).toString(),
      siblings: siblings,
      enabled: enabled,
      keys: publishIndex,
      values: values,
      informations: informations,
      signatures: signatures,
    };
    var data;
    data = await generateClaimProofWithRapid(
      input,
      amountDataPublish,
      currentRoot
    );
    for (var i = 0; i < unpublishedData.length; i++) {
      await smtCache.deleteId(length + i);
    }
    return data;
  } catch (err) {
    for (var i = 0; i < handleError; i++) {
      await smtCache.deleteId(length + i);
    }
    throw Error((err as Error).message);
  }
}

async function published(req: Request) {
  // Update DB
  var dataRaw = req.body;
  var smtDb: ClaimTree = await LevelDB.getInstance();
  var smtCache: ClaimTree = await CacheDB.getInstance();
  const F = smtDb.smt.F;
  var unpublishedData = await getUnpublished();
  var length = await getPublishIndex();
  for (let i = 0; i < unpublishedData.length; i++) {
    var unpublishedTmp: IClaim = unpublishedData[i];
    await smtCache.addId(
      BigInt(length + i),
      unpublishedTmp.publicKey,
      BigInt(unpublishedTmp.CCCD),
      BigInt(unpublishedTmp.sex),
      BigInt(unpublishedTmp.DoBdate),
      BigInt(unpublishedTmp.BirthPlace)
    );
  }
  if (F.toObject(smtCache.getRoot()).toString() != dataRaw.root) {
    for (let i = 0; i < unpublishedData.length; i++) {
      await smtDb.deleteId(length + i);
    }
    throw Error("Invalid claim tree root");
  }
  for (let i = 0; i < unpublishedData.length; i++) {
    var unpublishedTmp: IClaim = unpublishedData[i];
    let resInsert = await smtDb.addId(
      BigInt(length + i),
      unpublishedTmp.publicKey,
      BigInt(unpublishedTmp.CCCD),
      BigInt(unpublishedTmp.sex),
      BigInt(unpublishedTmp.DoBdate),
      BigInt(unpublishedTmp.BirthPlace)
    );
  }

  if (F.toObject(smtDb.getRoot()).toString() != dataRaw.root) {
    for (let i = 0; i < unpublishedData.length; i++) {
      await smtDb.deleteId(length + i);
      await smtCache.deleteId(length + i);
    }
    throw Error("Invalid claim tree root");
  }

  for (let i = 0; i < unpublishedData.length; i++) {
    var unpublishedTmp: IClaim = unpublishedData[i];
    await Issue.findOneAndUpdate(
      { CCCD: unpublishedTmp.CCCD },
      { status: IdentityStatus.PUBLISHED, publishAt: Date.now() }
    );
    await Claim.findOneAndUpdate(
      { CCCD: unpublishedTmp.CCCD },
      { isPublish: true }
    );
    var mapping = new IdentityMapping({
      indexCard: length + i,
      publicKey: unpublishedTmp.publicKey,
    });
    var identityCard = new IdentityCard({
      leafIndex: length + i,
      CCCD: unpublishedTmp.CCCD,
      firstName: unpublishedTmp.firstName,
      lastName: unpublishedTmp.lastName,
      sex: unpublishedTmp.sex,
      DoBdate: unpublishedTmp.DoBdate,
      BirthPlace: unpublishedTmp.BirthPlace,
      claimAt: unpublishedTmp.claimAt,
      status: IdentityStatus.PUBLISHED,
    });
    var newPublish = new Publish({
      batchId: 0,
      claimId: i,
      root: F.toObject(smtDb.getRoot()).toString(),
      publishAt: Date.now(),
    });

    newPublish.save();
    identityCard.save();
    mapping.save();
  }
}

export { getAllPublished, published, getPublishDataProof };
