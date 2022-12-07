import { Schema, model, Document } from "mongoose";

export interface IRole extends Document {
  publicKey: string[];
}

const RoleSchema: Schema = new Schema({
  publicKey: { type: Array, require: true, unique: true },
});

export default model<IRole>("Role", RoleSchema);
