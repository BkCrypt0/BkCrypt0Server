const mongoose = require("mongoose");
const rolesSchema = new mongoose.Schema({
  publicKey: {
    type: Array,
  },
});

const adminRoles = mongoose.model("Role", rolesSchema);

require("dotenv").config();

// const mongdbUrl = process.env.mongoDb;
mongoose
  .connect(process.env.mongoDb)
  .then(async () => {
    console.log("Database connected!")
  })
  .catch((err) => console.log(err));

const database = mongoose.connection;
database.on("error", (error) => {
  console.log(error);
});

database.once("connected", () => {
  console.log("Database Connected");
});

async function main() {
  publickeyX = process.env.PUBLICKEYX;
  publickeyY = process.env.PUBLICKEYY;

  var newAdmin = new adminRoles({ publicKey: [publickeyX, publickeyY] });
  await newAdmin.save();
}

main().then(() => {
  console.log("Insert success");
  mongoose.connection.close();
}).catch((err) => console.log(err));
