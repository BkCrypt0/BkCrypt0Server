import express, { Request, Response, NextFunction } from "express";
import { hashMimc } from "../../connect";

const router = express.Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    var dataHash = req.body.array;
    const hash = await hashMimc.getInstance();
    const F = hash.F;
    var resData = F.toObject(hash(dataHash)).toString();
    return res.status(201).json({hashValue: resData});
  } catch (err) {
    console.error("Err POST /hash", err);
    next(err);
  }
});

export { router as hashRouter };
