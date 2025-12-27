// index.js
import { connectDB } from "./db.js";
import { createUser, getUsers, updateUser, deleteUser } from "./services/user.service.js";

async function main() {
  await connectDB();

  // CREATE
  const user = await createUser({
    name: "Tareq",
    email: "tareq@example.com",
    age: 30,
  });
  console.log("Created:", user);

  // READ
  const users = await getUsers();
  console.log("All users:", users);

  // UPDATE
  const updated = await updateUser(user._id, { age: 31 });
  console.log("Updated:", updated);

  // DELETE
  // await deleteUser(user._id);
  // console.log("Deleted user");
}

main().catch(console.error);
