import fs from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const CRED_PATH = path.join(process.cwd(), "credentials.json");

const getStore = () => {
  if (!fs.existsSync(CRED_PATH)) {
    const store = {
      jwtSecret: crypto.randomBytes(32).toString("hex"),
      users: [{ username: "admin", password: "admin", isDefault: true }],
    };
    fs.writeFileSync(CRED_PATH, JSON.stringify(store, null, 2));
    return store;
  }
  return JSON.parse(fs.readFileSync(CRED_PATH, "utf-8"));
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  const store = getStore();

  const user = store.users.find((u) => u.username === username);

  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  // Handle Default State
  if (user.isDefault && password === "admin") {
    return res.status(202).json({
      message: "Initial setup required for this account.",
      mustInitialize: true,
    });
  }

  // Handle Hashed Password
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ user: username }, store.jwtSecret, {
    expiresIn: "24h",
  });

  res
    .cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .json({ success: true });
};

export const updateCredentials = async (req, res) => {
  const { newUsername, newPassword, targetUser } = req.body;
  const store = getStore();

  // Find the user to update (either the current login or 'admin' during setup)
  const userIndex = store.users.findIndex(
    (u) => u.username === (targetUser || "admin"),
  );

  if (userIndex === -1)
    return res.status(404).json({ error: "User not found." });

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  store.users[userIndex] = {
    username: newUsername,
    password: hashedPassword,
    isDefault: false,
  };

  fs.writeFileSync(CRED_PATH, JSON.stringify(store, null, 2));
  res.json({ message: "Credentials updated. Please log in." });
};
