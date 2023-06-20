import express, { Request, Response, NextFunction } from "express";
import {
  getUserInformation,
  getUserProofMerkleTree,
} from "../controllers/userControllers";

const router = express.Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    var resData = await getUserInformation(req);
    return res.status(200).json(resData);
  } catch (err) {
    console.error("Err GET /user/:address", err);
    return res.status(404).json({ errMessage: (err as Error).message });
  }
});

router.get(
  "/proof/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      var resData = await getUserProofMerkleTree(req);
      return res.status(201).json(resData);
    } catch (err) {
      console.error("Err GET /users/:address/proof", err);
      return res.status(404).json({ errMessage: (err as Error).message });
    }
  }
);

export { router as userRouter };
