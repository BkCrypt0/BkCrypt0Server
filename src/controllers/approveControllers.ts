import * as mongoose from "mongoose";
import Issue, { IIssue } from "../models/IssueSchema";
import IdentityCard, { IIdentityCard } from "../models/identityCard";
import IdentityMapping, { IIdentityMapping } from "../models/identityMapping";
import { Request } from "express";
import { IdentityStatus } from "../config/constant";
import { verifyRequestIssue } from "../utils/verifySignature";
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

async function isApproved(issue: IIssue | null): Promise<Boolean> {
  if (issue == null) {
    return true;
  } else if (issue.status != IdentityStatus.REVIEWING) {
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
    issue.name != identityCard.name ||
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

async function approveIdentity(req: Request) {
  var dataRaw = req.body;
  var approver = dataRaw.approver;
  var requester = dataRaw.requester;
  var issueFind: IIssue | null = await Issue.findOne({ CCCD: dataRaw.CCCD });

  await issueFind?.updateOne({
    approver: approver,
    status: IdentityStatus.APPROVED,
    approvedAt: Date.now(),
    owner: requester,
  });

  return await Issue.findOne({ CCCD: dataRaw.CCCD });
}

// async function claimMany(req: Request) {
//   try {
//     var dataRaw = req.body;
//     for (var i = 0; i < dataRaw.length; i++) {
//       var dataTmp = dataRaw[i];
//       var publicKeyTmp = dataTmp.publicKey;
//       var signatureTmp = dataTmp.signature;
//       var issueFind: IIssue | null = await Issue.findOne({
//         CCCD: dataTmp.CCCD,
//       });

//       if (await isExistIdentity(dataTmp)) {
//         throw Error("!Claimed");
//       } else if (!(await isExistIssue(dataTmp, issueFind))) {
//         throw Error("!Issue not exist");
//       } else if (await isApproved(dataRaw, issueFind)) {
//         throw Error("!Claimed");
//       } else if (await isMapping(publicKeyTmp)) {
//         throw Error("!Mapped");
//       }

//       var verify = await verifyClaim(
//         dataTmp.publicKey,
//         dataTmp.CCCD,
//         dataTmp.sex,
//         dataTmp.DoBdate,
//         dataTmp.BirthPlace,
//         dataTmp.signature,
//         await Eddsa.getInstance()
//       );
//       if (!verify) {
//         throw Error("Invalid Signature");
//       }

//       await issueFind?.updateOne({
//         status: IdentityStatus.CLAIMED,
//         claimAt: Date.now(),
//         claimer: publicKeyTmp,
//       });

//       var newApprove = new Approve({
//         publicKey: dataTmp.publicKey,
//         CCCD: dataTmp.CCCD,
//         name: dataTmp.name,
//         sex: dataTmp.sex,
//         DoBdate: dataTmp.DoBdate,
//         BirthPlace: dataTmp.BirthPlace,
//         approveAt: Date.now(),
//         signature: dataTmp.signature,
//       });
//       await newApprove.save();
//     }
//   } catch (err) {
//     throw Error((err as Error).message);
//   }
// }

export { approveIdentity };
