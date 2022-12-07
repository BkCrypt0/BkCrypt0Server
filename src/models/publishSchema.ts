import { Schema, model, Document } from "mongoose";

export interface IPublish extends Document {
  batchId: number;
  claimId: number;
  root: string;
  publishAt: number;
}

const PublishSchema: Schema = new Schema({
  batchId: { type: Number, require: true },
  claimId: { type: Number, require: true },
  root: { type: String, require: true },
  publishAt: { type: Date, require: true },
});

export default model<IPublish>("Publish", PublishSchema);
