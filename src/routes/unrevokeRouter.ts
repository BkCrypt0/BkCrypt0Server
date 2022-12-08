import express, { Request, Response, NextFunction } from "express";
import { claimIdentity } from "../controllers/claimControllers";
import { unrevoke , getUnRevokeData} from "../controllers/unrevokeControllers";
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

    var resData = await getUnRevokeData(req)
    return res.status(201).json(resData);
    } catch (err) {
      console.error("Error POST /unrevoke/data", err);
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
    var resData = await unrevoke(req);
    return res.status(201).json(resData);
  } catch (err) {
    console.error("Error POST /revoke/", err);
    return res.status(404).json({ errMessage: (err as Error).message });
  }
});

export { router as unrevokeRouter };
