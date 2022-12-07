import Issue, { IIssue } from "../models/IssueSchema";

async function isIssue(issue: IIssue): Promise<Boolean> {
  var resFind = await Issue.findOne({ CCCD: issue.CCCD });
  if (resFind == null) {
    return false;
  } else {
    return true;
  }
}

export { isIssue };
