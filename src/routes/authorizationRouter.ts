import express, { Request, Response, NextFunction } from "express";
import { getRoles } from "../controllers/authorizationControllers";

const router = express.Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    var resData = await getRoles(req);
    return res.status(201).json({roles: resData});
  } catch (err) {
    console.error("Err GET /user/:address", err);
    return res.status(404).json({ errMessage: (err as Error).message });
  }
});

export { router as authenRouter };
