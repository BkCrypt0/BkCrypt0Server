import * as mongoose from "mongoose";
import { ProvinceSchema } from "../models/provinceSchema";
import { Request, Response } from "express";
const Province = mongoose.model("Province", ProvinceSchema);

async function getAllProvince() {
  var issueData = Province.find();
  return issueData;
}

async function addNewProvince(req: Request) {
  var dataRaw = req.body;
  var issue = new Province(dataRaw);
  issue.save();
  return issue;
}

async function getProvinceByName(req: Request) {
  var dataRaw = req.query;
  return Province.find({ name: dataRaw.name });
}

async function getProvinceById(req: Request) {
  var dataRaw = req.query;
  return Province.findOne({ code: dataRaw.CCCD });
}

export { getAllProvince, addNewProvince, getProvinceByName, getProvinceById };
