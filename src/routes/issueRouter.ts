import express, { Request, Response, NextFunction } from "express";
import {
  getAllIssue,
  issueNewIdentityCard,
  issueListIdentity,
} from "../controllers/issueControllers";
import multer from "multer";

const router = express.Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    var issueData = await getAllIssue();
    return res.status(201).json(issueData);
  } catch (err) {
    console.log("Error GET /issue/", err);

    return res.status(404).json({ errMessage: (err as Error).message});
  }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    var issueNew = await issueNewIdentityCard(req);
    return res.status(201).json(issueNew);
  } catch (err) {
    console.error("Err POST /issue", err);

    return res.status(404).json({ errMessage: (err as Error).message});
  }
});

router.post(
  "/import",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      var resIssue = await issueListIdentity(req);
      return res.status(201).json(resIssue);
    } catch (err) {
      console.log("Error POST /issue/import", err);
      next(err);
      return res.status(404).json({ errMessage: err });
    }
  }
);

export { router as issueRouter };
