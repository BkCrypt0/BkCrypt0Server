import express, { Request, Response } from "express";
import {
  addNewProvince,
  getAllProvince,
  getProvinceByName,
} from "../controllers/mappingControllers";

const router = express.Router();

router.get("/city", async (req: Request, res: Response) => {
  var cities = await getAllProvince();
  return res.status(201).json(cities);
});

router.get("/city/:name", async (req: Request, res: Response) => {
  var codeCity = await getProvinceByName(req);
  return res.status(201).json(codeCity);
});

router.post("/city", async (req: Request, res: Response) => {
  var resAdd = await addNewProvince(req);
  return res.status(201).json(resAdd);
});

export { router as mappingRouter };
