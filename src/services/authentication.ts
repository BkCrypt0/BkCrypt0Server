import Role, { IRole } from "../models/roles";

async function isAdmin(pubkey: String): Promise<Boolean> {
  // var resFind = await Role.findOne({ publicKey: pubkey });
  // if (resFind == null) {
  //     return false;
  // } else {
  //     return true;
  // }
  return true;
}

export { isAdmin };
