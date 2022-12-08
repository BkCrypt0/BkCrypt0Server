import express, { Request, Response, NextFunction } from "express";
import { claimIdentity, claimMany } from '../controllers/claimControllers'
import { isAdmin } from "../services/authentication";

const router = express.Router();

// Only Admin
router.get("/", async (req: Request, res: Response) => {
  return res.send("All claimed");
});

//Only Admin or user
router.get(
  "users/:address",
  async (req: Request, res: Response, next: NextFunction) => {
    return res.send("User claimed information");
  }
);

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    var pubkey = req.body.publicKey;
    if (!isAdmin(pubkey)) {
      return res.status(401).json({ message: "Authentication" });
    }
    var resData = await claimIdentity(req);
    return res.status(201).json(resData);
  } catch (err) {
    console.error("Error POST /claimed/", err);
    return res.status(404).json({ errMessage: (err as Error).message });
  }
});

router.post(
  "/import",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      var pubkey = req.body.publicKey;
      if (!isAdmin(pubkey)) {
        return res.status(401).json({ message: "Authentication" });
      }
      var resData = await claimMany(req);
      return res.status(201).json(resData);
    } catch (err) {
      console.error("Error POST /claimed/import", err);
      return res.status(404).json({ errMessage: (err as Error).message });
    }
  }
);

export { router as claimRouter };

