import { Schema, model, Document } from "mongoose";

export interface IIssue extends Document {
  requester: string[];
  requestAt: number;
  owner: string[];
  approver: string[];
  CCCD: string;
  name: string;
  sexDetail: string;
  sex: number;
  DoBdate: number;
  BirthPlaceDetail: string;
  BirthPlace: number;
  approvedAt: number;
  signature: object;
  status: number;
}

const IssueSchema: Schema = new Schema({
  requester: { type: Array, require: true },
  requestAt: { type: Number, require: true },
  owner: { type: Array, default: "" },
  approver: { type: Array, require: true, default: "" },
  CCCD: { type: String, require: true, unique: true },
  name: { type: String, require: true },
  sexDetail: { type: String, require: true },
  sex: { type: Number, require: true },
  DoBdate: { type: Number, require: true },
  BirthPlaceDetail: { type: String, require: true },
  BirthPlace: { type: Number, require: true },
  approvedAt: { type: Number, require: true, default: 0 },
  signature: { type: Object, require: true },
  status: { type: Number, require: true, default: 0 },
});

export default model<IIssue>("Issue", IssueSchema);
