import express, { Request, Response, NextFunction } from "express";
import { revoke, getRevokeData } from "../controllers/revokeControllers";
import { isAdmin } from "../services/authentication";

const router = express.Router();

router.post(
  "/data",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      var pubkey = req.body.publicKey;
      if (!isAdmin(pubkey)) {
        return res.status(401).json({ message: "Authentication" });
      }

      var resData = await getRevokeData(req);
      return res.status(201).json(resData);
    } catch (err) {
      console.error("Error POST /revoke/data", err);
      return res.status(404).json({ errMessage: (err as Error).message });
    }
  }
);

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    var pubkey = req.body.publicKey;
    if (!isAdmin(pubkey)) {
      return res.status(401).json({ message: "Authentication" });
    }
    var resData = await revoke(req);
    return res.status(201).json(resData);
  } catch (err) {
    console.error("Error POST /claimed/", err);
    return res.status(404).json({ errMessage: (err as Error).message });
  }
});

export { router as revokeRouter };
