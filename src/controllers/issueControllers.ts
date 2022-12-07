import * as mongoose from "mongoose";
import Issue, { IIssue } from "../models/IssueSchema";
import { Request, Response } from "express";
import { isIssue } from "../services/checkIssue";

async function getAllIssue(): Promise<IIssue[]> {
  var issuaData = Issue.find();
  return issuaData;
}

async function issueNewIdentityCard(req: Request): Promise<IIssue | null> {
  var dataRaw = req.body;
  var checkIssue = await isIssue(dataRaw);
  if (checkIssue) {
    throw Error("Issue Exist");
  }
  var issue: IIssue = new Issue(dataRaw);
  issue.issueAt = Date.now();
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
