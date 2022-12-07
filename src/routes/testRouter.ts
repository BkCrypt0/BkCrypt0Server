import express, { Request, Response, NextFunction } from "express";
import { claimIdentity } from "../controllers/claimControllers";
import { testrevoke } from "../controllers/testControllers";
import { isAdmin } from "../services/authentication";
import { notRevoke } from "../controllers/testControllers";

const router = express.Router();

router.post(
  "/revoke",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      var resData = await testrevoke(req);
      return res.status(201).json(resData);
    } catch (err) {
      console.error("Error POST /claimed/", err);
      return res.status(404).json({ errMessage: (err as Error).message });
    }
  }
);

router.post(
  "/notRevoke",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      var resData = await notRevoke(req);
      return res.status(201).json(resData);
    } catch (err) {
      console.error("Error POST /claimed/", err);
      return res.status(404).json({ errMessage: (err as Error).message });
    }
  }
);

export { router as testRouter };
