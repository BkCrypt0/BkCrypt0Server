import express from "express";
import { json } from "body-parser";
import cors from "cors";
import { claimRouter } from "./src/routes/claimRouter";
import { userRouter } from "./src/routes/userRouter";
import { publishedRouter } from "./src/routes/publishedRouter";
import { issueRouter } from "./src/routes/issueRouter";
import { mappingRouter } from "./src/routes/mappingRouter";
import { revokeRouter } from "./src/routes/revokeRouter";

//Dotenv
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
//DB
import {CacheDB, connectMongo, Eddsa, LevelDB, RevokeCache, RevokeDb, TestLevelDB} from './connect'
import { authenRouter } from "./src/routes/authorizationRouter";
import { hashRouter } from "./src/routes/hashRouter";
import { hashMimc } from "./connect";
import { unrevokeRouter } from "./src/routes/unrevokeRouter";

var app = express();
const port = process.env.PORT; // default port to listen
connectMongo()

app.use(json());
app.use(cors());
app.use("/claimed", claimRouter);
app.use("/users", userRouter);
app.use("/published", publishedRouter);
app.use("/issue", issueRouter);
app.use("/mapping", mappingRouter);
app.use("/revoke", revokeRouter)
// app.use("/test", testRouter);
app.use("/authen", authenRouter);
app.use("/hash", hashRouter)
app.use("/unrevoke", unrevokeRouter);

// define a route handler for the default home page
app.get("/", async (req, res) => {
  // render the index template

  res.send("BkCrypto");
});


// start the express server
app.listen(port, async () => {
  var db = await LevelDB.getInstance();
  await RevokeDb.getInstance();
  await RevokeCache.getInstance();
  await hashMimc.getInstance(); 
  await CacheDB.getInstance();
  await Eddsa.getInstance();
  console.log(`server started at http://localhost:${port}`);
});
