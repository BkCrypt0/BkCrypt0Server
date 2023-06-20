import mongoose, { Schema, model, Document } from "mongoose";

export interface IIdentityCard extends Document {
  leafIndex: number;
  CCCD: string;
  name: string;
  sex: number;
  DoBdate: number;
  BirthPlace: number;
  approvedAt: number;
  status: number;
}

const IdentityCardSchema: Schema = new Schema({
  leafIndex: { type: Number, require: true, unique: true },
  CCCD: { type: String, require: true, unique: true },
  name: { type: String, require: true },
  sex: { type: Number, require: true },
  DoBdate: { type: Number, require: true },
  BirthPlace: { type: Number, require: true },
  approvedAt: { type: Number, require: true, default: 0 },
  status: { type: Number, require: true },
});

export default mongoose.model<IIdentityCard>(
  "IdentityCard",
  IdentityCardSchema
);
