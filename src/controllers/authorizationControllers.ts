import Roles from "../models/roles"
import {Request} from "express"

async function getRoles(req:Request) {
  var publicKeyX = req.query.publicKeyX;
  var publicKeyY = req.query.publicKeyY

  var resFind = await Roles.findOne({publicKey: [publicKeyX, publicKeyY]})
  if (resFind == null) {
    return 0;
  } else {
    return 1;
  }
}

export {
  getRoles
}