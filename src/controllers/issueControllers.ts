import Issue, { IIssue } from "../models/IssueSchema";
import { Request } from "express";
import { isIssue } from "../services/checkIssue";
import { verifyRequestIssue } from "../utils/verifySignature";
import { Eddsa } from "../../connect";

async function getAllIssue(): Promise<IIssue[]> {
  var issueData = Issue.find();
  return issueData;
}

async function issueNewIdentityCard(req: Request): Promise<IIssue | null> {
  var dataRaw = req.body;
  var checkIssue = await isIssue(dataRaw);
  if (checkIssue) {
    throw Error("Issue Exist");
  }

  var verify = await verifyRequestIssue(
    dataRaw.requester,
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

  var issue: IIssue = new Issue(dataRaw);
  issue.requestAt = Date.now();
  issue.save();
  return issue;
}

async function issueListIdentity(req: Request): Promise<IIssue[]> {
  var dataRaw = req.body;
  var checkIssue;
  for (let i = 0; i < dataRaw.length; ++i) {
    checkIssue = await isIssue(dataRaw[i]);
    if (checkIssue) {
      throw Error(`Issue Exist: ${dataRaw[i].CCCD}`);
    }
  }
  for (let i = 0; i < dataRaw.length; ++i) {
    var issueTmp = dataRaw[i];
    var newIssue = new Issue(issueTmp);
    newIssue.save();
  }
  return await Issue.find();
}

export { getAllIssue, issueNewIdentityCard, issueListIdentity };
