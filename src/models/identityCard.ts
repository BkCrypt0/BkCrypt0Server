import mongoose, { Schema, model, Document } from "mongoose";

export interface IIdentityCard extends Document {
  leafIndex: number;
  CCCD: string;
  firstName: string;
  lastName: string;
  sex: number;
  DoBdate: number;
  BirthPlace: number;
  claimAt: number;
  status: number;
}

const IdentityCardSchema: Schema = new Schema({
  leafIndex: { type: Number, require: true, unique: true },
  CCCD: { type: String, require: true, unique: true },
  firstName: { type: String, require: true },
  lastName: { type: String, require: true },
  sex: { type: Number, require: true },
  DoBdate: { type: Number, require: true },
  BirthPlace: { type: Number, require: true },
  claimAt: { type: Number, require: true, default: 0 },
  status: {type: Number, require: true}
});

export default mongoose.model<IIdentityCard>(
  "IdentityCard",
  IdentityCardSchema
);
