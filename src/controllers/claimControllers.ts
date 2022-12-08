import * as mongoose from "mongoose";
import Issue, { IIssue } from "../models/IssueSchema";
import IdentityCard, { IIdentityCard } from "../models/identityCard";
import IdentityMapping, { IIdentityMapping } from "../models/identityMapping";
import Claim, { IClaim } from "../models/claim";
import { Request } from "express";
import { IdentityStatus } from "../config/constant";
import { verifyClaim } from "../utils/verifySignature";
import { Eddsa } from "../../connect";

async function isExistIdentity(identityCard: IIdentityCard): Promise<Boolean> {
  var CCCD: string = identityCard.CCCD;
  var resFind: IIdentityCard | null = await IdentityCard.findOne({
    CCCD: CCCD,
  });
  if (resFind == null) {
    return false;
  } else {
    return true;
  }
}

async function isClaimed(
  identityCard: IIdentityCard,
  issue: IIssue | null
): Promise<Boolean> {
  var CCCD: string = identityCard.CCCD;
  if (issue == null) {
    return true;
  } else if (issue.status != IdentityStatus.PENDING) {
    return true;
  } else {
    return false;
  }
}

async function isExistIssue(
  identityCard: IIdentityCard,
  issue: IIssue | null
): Promise<Boolean> {
  var CCCD: string = identityCard.CCCD;
  if (issue == null) {
    return false;
  } else if (
    issue.firstName != identityCard.firstName ||
    issue.lastName != identityCard.lastName ||
    issue.sex != identityCard.sex ||
    issue.DoBdate != identityCard.DoBdate ||
    issue.BirthPlace != identityCard.BirthPlace
  ) {
    return false;
  } else {
    return true;
  }
}

async function isMapping(publicKey: String): Promise<Boolean> {
  var resFind = await IdentityMapping.findOne({ publicKey: publicKey });
  if (resFind == null) {
    return false;
  } else {
    return true;
  }
}

async function claimIdentity(req: Request) {
  var dataRaw = req.body;
  var publicKey = dataRaw.publicKey;
  var signature = dataRaw.signature;
  var issueFind: IIssue | null = await Issue.findOne({ CCCD: dataRaw.CCCD });

  if (await isExistIdentity(dataRaw)) {
    throw Error("!Claimed");
  } else if (!(await isExistIssue(dataRaw, issueFind))) {
    throw Error("!Issue not exist");
  } else if (await isClaimed(dataRaw, issueFind)) {
    throw Error("!Claimed");
  } else if (await isMapping(publicKey)) {
    throw Error("!Mapped");
  }

  var verify = await verifyClaim(
    dataRaw.publicKey,
    dataRaw.CCCD,
    dataRaw.sex,
    dataRaw.DoBdate,
    dataRaw.BirthPlace,
    dataRaw.signature,
    await Eddsa.getInstance()
  );
  if (!verify) {
    throw Error("Invalid Signature");
  }

  await issueFind?.updateOne({
    status: IdentityStatus.CLAIMED,
    claimAt: Date.now(),
    claimer: publicKey,
  });

  var newClaim = new Claim({
    publicKey: dataRaw.publicKey,
    CCCD: dataRaw.CCCD,
    firstName: dataRaw.firstName,
    lastName: dataRaw.lastName,
    sex: dataRaw.sex,
    DoBdate: dataRaw.DoBdate,
    BirthPlace: dataRaw.BirthPlace,
    claimAt: Date.now(),
    signature: dataRaw.signature,
  });
  await newClaim.save();

  return await Issue.findOne({ CCCD: dataRaw.CCCD });
}

async function claimMany(req: Request) {
  try {
    var dataRaw = req.body;
    for (var i = 0; i < dataRaw.length; i++) {
      var dataTmp = dataRaw[i];
      var publicKeyTmp = dataTmp.publicKey;
      var signatureTmp = dataTmp.signature;
      var issueFind: IIssue | null = await Issue.findOne({
        CCCD: dataTmp.CCCD,
      });

      if (await isExistIdentity(dataTmp)) {
        throw Error("!Claimed");
      } else if (!(await isExistIssue(dataTmp, issueFind))) {
        throw Error("!Issue not exist");
      } else if (await isClaimed(dataRaw, issueFind)) {
        throw Error("!Claimed");
      } else if (await isMapping(publicKeyTmp)) {
        throw Error("!Mapped");
      }

      var verify = await verifyClaim(
        dataTmp.publicKey,
        dataTmp.CCCD,
        dataTmp.sex,
        dataTmp.DoBdate,
        dataTmp.BirthPlace,
        dataTmp.signature,
        await Eddsa.getInstance()
      );
      if (!verify) {
        throw Error("Invalid Signature");
      }

      await issueFind?.updateOne({
        status: IdentityStatus.CLAIMED,
        claimAt: Date.now(),
        claimer: publicKeyTmp,
      });

      var newClaim = new Claim({
        publicKey: dataTmp.publicKey,
        CCCD: dataTmp.CCCD,
        firstName: dataTmp.firstName,
        lastName: dataTmp.lastName,
        sex: dataTmp.sex,
        DoBdate: dataTmp.DoBdate,
        BirthPlace: dataTmp.BirthPlace,
        claimAt: Date.now(),
        signature: dataTmp.signature,
      });
      await newClaim.save();
    }
  } catch (err) {
    throw Error((err as Error).message)
  }
}

export { claimIdentity, claimMany };
