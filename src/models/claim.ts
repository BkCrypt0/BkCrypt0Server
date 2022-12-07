import mongoose, { Schema, model, Document } from "mongoose";

export interface IClaim extends Document {
  publicKey: string[];
  CCCD: string;
  firstName: string;
  lastName: string;
  sex: number;
  DoBdate: number;
  BirthPlace: number;
  claimAt: number;
  signature: object;
  isPublish: boolean;
}

const ClaimSchema: Schema = new Schema({
  publicKey: {type: Array, require: true},
  CCCD: { type: String, require: true, unique: true },
  firstName: { type: String, require: true },
  lastName: { type: String, require: true },
  sex: { type: Number, require: true },
  DoBdate: { type: Number, require: true },
  BirthPlace: { type: Number, require: true },
  claimAt: { type: Number, require: true, default: 0 },
  signature: {type: Object, required: true},
  isPublish: {type: Boolean, required: true, default: false}
});

export default mongoose.model<IClaim>(
  "Claim",
  ClaimSchema
);
