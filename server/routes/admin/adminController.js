import fs from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs";

const CRED_PATH = path.join(process.cwd(), "credentials.json");

// Helper to read the store asynchronously
const getStore = async () => {
  const data = await fs.readFile(CRED_PATH, "utf-8");
  return JSON.parse(data);
};

export const updateCredentials = async (req, res) => {
  try {
    const { newUsername, newPassword, targetUser } = req.body;
    const store = await getStore();

    // RBAC Logic: 
    // 1. If targetUser is provided, check if the requester is an admin.
    // 2. Otherwise, default to the requester's own identity from the JWT.
    const requester = req.user.user; 
    const isAdmin = req.user.role === "admin"; // Assumes your JWT includes a 'role' field
    
    const userToUpdate = (targetUser && isAdmin) ? targetUser : requester;

    // Prevent non-admins from trying to use targetUser
    if (targetUser && !isAdmin) {
      return res.status(403).json({ error: "Forbidden: You cannot update other users." });
    }

    const userIndex = store.users.findIndex((u) => u.username === userToUpdate);
    if (userIndex === -1) return res.status(404).json({ error: "User not found." });

    // Hash and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    store.users[userIndex] = {
      ...store.users[userIndex],
      username: newUsername || store.users[userIndex].username,
      password: hashedPassword,
      isDefault: false,
    };

    await fs.writeFile(CRED_PATH, JSON.stringify(store, null, 2));
    res.json({ message: `Credentials for ${userToUpdate} updated successfully.` });
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
};

export const listUsers = async (req, res) => {
  try {
    const store = await getStore();
    const usernames = store.users.map(({ username, isDefault }) => ({ username, isDefault }));
    res.json(usernames);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve users." });
  }
};