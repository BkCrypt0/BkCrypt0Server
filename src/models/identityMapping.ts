import { Schema, model, Document } from "mongoose";

export interface IIdentityMapping extends Document {
  indexCard: number;
  publicKey: string[];
}

const IdentityMappingSchema: Schema = new Schema({
  indexCard: { type: Number, require: true },
  publicKey: { type: Array, require: true },
});

export default model<IIdentityMapping>(
  "IdentityMapping",
  IdentityMappingSchema
);
