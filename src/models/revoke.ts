import mongoose, { Schema, model, Document } from "mongoose";

export interface IRevoke extends Document {
  leafIndex: number;
  revoker: string[];
}

const RevokeSchema: Schema = new Schema({
  leafIndex: { type: Number, required: true },
  revoker: {type:Array, require: true}
});

export default mongoose.model<IRevoke>("IdentityCard", RevokeSchema);
