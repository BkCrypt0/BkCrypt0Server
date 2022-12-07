import { Schema, model, Document } from "mongoose";

export interface IProvince extends Document {
  name: string;
  code: number;
}

export const ProvinceSchema: Schema = new Schema({
  name: { type: String, require: true, unique: true },
  code: { type: Number, require: true, unique: true },
});
