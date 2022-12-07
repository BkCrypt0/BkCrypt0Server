import { Schema, model, Document } from "mongoose";

export interface IIssue extends Document {
  issuer: string[];
  issueAt: number;
  claimer: string[];
  CCCD: string;
  firstName: string;
  lastName: string;
  sex: number;
  DoBdate: number;
  BirthPlace: number;
  claimAt: number;
  status: number;
}

const IssueSchema: Schema = new Schema({
  issuer: { type: Array, require: true },
  issueAt: { type: Number, require: true },
  claimer: { type: Array, require: true, default: "" },
  CCCD: { type: String, require: true, unique: true },
  firstName: { type: String, require: true },
  lastName: { type: String, require: true },
  sex: { type: Number, require: true },
  DoBdate: { type: Number, require: true },
  BirthPlace: { type: Number, require: true },
  claimAt: { type: Number, require: true, default: 0 },
  status: { type: Number, require: true, default: 0 },
});

export default model<IIssue>("Issue", IssueSchema);
