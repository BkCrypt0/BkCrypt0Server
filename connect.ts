import mongoose, { model } from "mongoose";
import claimTree, { ClaimTree } from "./src/utils/claimTree";
import { newClaimMemTree, ClaimMemTree } from "./src/utils/claimMemTree";
import { RevokeTree, newLevelDbRevokeTree } from "./src/utils/revokeTree";
import crypto, { eddsa } from "./src/utils/crypto";

const defaultMongoUrl: string = "mongodb://test:test@localhost:27027/identity";
const defaultLevelUrl: string = "smt";
const defaultCacheUrl: string = "cache-smt";
const defaultRevokeUrl: string = "revoke-smt";
const defaultRevokeCache: string = "revoke-cache";

function connectMongo() {
  var mongoDbUrl: string = process.env.mongoDb || defaultMongoUrl;

  mongoose.connect(mongoDbUrl);
  const database = mongoose.connection;
  database.on("error", (error) => {
    console.log(error);
  });

  database.once("connected", () => {
    console.log("Database Connected");
  });
}

export class LevelDB {
  private static instance: ClaimTree | null = null;

  private constructor() {}

  static async getInstance(): Promise<ClaimTree> {
    if (LevelDB.instance == null) {
      const levelDbUrl = process.env.levelDb || defaultLevelUrl;
      const deep = Number(process.env.DEEP);
      LevelDB.instance = await claimTree.newLevelDbClaimTree(levelDbUrl, deep);
    }

    return LevelDB.instance;
  }
}

export class CacheDB {
  private static instance: ClaimTree | null = null;

  private constructor() {}

  static async getInstance(): Promise<ClaimTree> {
    if (CacheDB.instance == null) {
      const cacheDBUrl = process.env.CACHEDB || defaultCacheUrl;
      const deep = Number(process.env.DEEP);
      CacheDB.instance = await claimTree.newLevelDbClaimTree(cacheDBUrl, deep);
    }

    return CacheDB.instance;
  }
}

export class RevokeDb {
  private static instance: RevokeTree | null = null;

  private constructor() {}

  static async getInstance(): Promise<RevokeTree> {
    if (RevokeDb.instance == null) {
      const levelDbUrl = process.env.REVOKE_DB || defaultRevokeUrl;
      const deep = Number(process.env.DEEP);
      RevokeDb.instance = await newLevelDbRevokeTree(levelDbUrl, deep);
    }

    return RevokeDb.instance;
  }
}

export class RevokeCache {
  private static instance: RevokeTree | null = null;

  private constructor() {}

  static async getInstance(): Promise<RevokeTree> {
    if (RevokeCache.instance == null) {
      const levelDbUrl = process.env.REVOKE_CACHE || defaultRevokeCache;
      const deep = Number(process.env.DEEP);
      RevokeCache.instance = await newLevelDbRevokeTree(levelDbUrl, deep);
    }

    return RevokeCache.instance;
  }
}

export class TestLevelDB {
  private static instance: ClaimTree | null = null;

  private constructor() {}

  static async getInstance(): Promise<ClaimTree> {
    if (TestLevelDB.instance == null) {
      const levelDbUrl = "testsmt";
      const deep = Number(process.env.DEEP);
      TestLevelDB.instance = await claimTree.newLevelDbClaimTree(
        levelDbUrl,
        deep
      );
    }

    return TestLevelDB.instance;
  }
}

export class TestRevokeDb {
  private static instance: RevokeTree | null = null;

  private constructor() {}

  static async getInstance(): Promise<RevokeTree> {
    if (TestRevokeDb.instance == null) {
      const levelDbUrl = "testrovoke";
      const deep = Number(process.env.DEEP);
      TestRevokeDb.instance = await newLevelDbRevokeTree(levelDbUrl, deep);
    }

    return TestRevokeDb.instance;
  }
}

export class hashMimc {
  private static instance: any | null = null;
  private constructor() {}

  static async getInstance(): Promise<any> {
    if (hashMimc.instance == null) {
      const mimcHash = await crypto.mimc7;
      hashMimc.instance = mimcHash;
    }
    return hashMimc.instance;
  }
}

export class Eddsa {
  private static instance: any | null = null;
  private constructor() {}

  static async getInstance(): Promise<any> {
    if (Eddsa.instance == null) {
      const eddsa = await crypto.eddsa();
      Eddsa.instance = eddsa;
    }
    return Eddsa.instance;
  }
}

export class ClaimTreeCache {
  private static instance: ClaimMemTree | null = null;
  private constructor() {}

  static async getInstance(): Promise<ClaimMemTree> {
    if (ClaimTreeCache.instance == null) {
      const deep = Number(process.env.DEEP);
      ClaimTreeCache.instance = await newClaimMemTree(deep);
    }
    return ClaimTreeCache.instance;
  }
}

export { connectMongo };
