import express, { Request, Response } from "express";
import { getPublishDataProof, published } from "../controllers/publishedControllers";
import { isAdmin } from "../services/authentication";

const router = express.Router();

router.get("/data", async (req: Request, res: Response) => {
  try {
    var pubkey = req.body.publicKey;
    if (!isAdmin(pubkey)) {
      return res.status(401).json({ message: "Authentication" });
    }
    var resData = await getPublishDataProof(req);
    return res.status(201).json(resData);
  } catch (err) {
    console.error("Error GET /published/data", err);
    return res.status(404).json({ errMessage: (err as Error).message });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    var pubkey = req.body.publicKey;
    if (!isAdmin(pubkey)) {
      return res.status(401).json({ message: "Authentication" });
    }
    var resData = await published(req);
    return res.status(201).json(resData);
  } catch (err) {
    console.error("Error POST /published", err);
    return res.status(404).json({ errMessage: (err as Error).message });
  }
});

export { router as publishedRouter };
