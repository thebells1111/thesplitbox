import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const CRED_PATH = path.join(process.cwd(), "credentials.json");

const getStore = () => JSON.parse(fs.readFileSync(CRED_PATH, "utf-8"));

export const updateCredentials = async (req, res) => {
  const { newUsername, newPassword, targetUser } = req.body;
  const store = getStore();

  // If targetUser isn't provided, we assume the person wants to update their own account
  // req.user.user comes from the decoded JWT in your verifyToken middleware
  const userToUpdate = targetUser || req.user.user;

  const userIndex = store.users.findIndex((u) => u.username === userToUpdate);

  if (userIndex === -1)
    return res.status(404).json({ error: "User not found." });

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  store.users[userIndex] = {
    username: newUsername,
    password: hashedPassword,
    isDefault: false,
  };

  fs.writeFileSync(CRED_PATH, JSON.stringify(store, null, 2));
  res.json({ message: "Credentials updated successfully." });
};

export const listUsers = (req, res) => {
  const store = getStore();
  // Return usernames only - never send the hashes back!
  const usernames = store.users.map((u) => ({
    username: u.username,
    isDefault: u.isDefault,
  }));
  res.json(usernames);
};
