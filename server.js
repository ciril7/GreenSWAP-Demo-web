// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

// folders & file
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "items.json");
const PUBLIC_DIR = path.join(__dirname, "public");

// ensure data folder and file exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf8");

// helpers
function readItems() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw || "[]");
  } catch (e) {
    console.error("Failed to read data:", e);
    return [];
  }
}
function writeItems(items) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), "utf8");
  } catch (e) {
    console.error("Failed to write data:", e);
  }
}

// API routes
app.get("/api/items", (req, res) => {
  const items = readItems();
  res.json(items);
});

app.post("/api/items", (req, res) => {
  const { name, category, price, user, email } = req.body;
  if (!name || name.trim() === "") return res.status(400).json({ error: "Item name is required" });

  const items = readItems();
  const item = {
    id: Date.now().toString(),
    name: String(name).trim(),
    category: category ? String(category).trim() : "",
    price: (price === "" || price == null) ? 0 : Number(price),
    user: user ? String(user).trim() : "Anonymous",
    email: email ? String(email).trim() : "",
    date: new Date().toISOString()
  };

  // add to start of array so newest appears first
  items.unshift(item);
  writeItems(items);

  res.json(item);
});

// serve frontend static files
app.use(express.static(PUBLIC_DIR));

// fallback to index.html for client-side routing (if any)
app.get("*", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ GreenSwap running — open http://localhost:${PORT}`);
});
