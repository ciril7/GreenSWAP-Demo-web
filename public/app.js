// app.js - frontend logic
const API = "/api/items";

document.getElementById("year").textContent = new Date().getFullYear();

const itemsArea = document.getElementById("itemsArea");
const refreshBtn = document.getElementById("refreshBtn");
const addForm = document.getElementById("addForm");

async function loadItems() {
  itemsArea.textContent = "Loading items…";
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error("Failed to load");
    const items = await res.json();
    renderItems(items);
  } catch (e) {
    itemsArea.textContent = "Could not load items. Is the server running?";
  }
}

function renderItems(items) {
  if (!items || items.length === 0) {
    itemsArea.innerHTML = "<p class='sub'>No items yet. Add the first one!</p>";
    return;
  }
  itemsArea.innerHTML = "";
  for (const it of items) {
    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `
      <div class="item-left">
        <div class="item-title">${escapeHtml(it.name)}</div>
        <div class="item-meta">${escapeHtml(it.category || "Uncategorized")} • ₹${it.price ?? 0}</div>
        <div class="item-meta">Listed by ${escapeHtml(it.user || "Anonymous")}${it.email ? ` (${escapeHtml(it.email)})` : ""}</div>
      </div>
      <div class="item-right">
        <div class="item-meta">${new Date(it.date).toLocaleDateString()}</div>
      </div>
    `;
    itemsArea.appendChild(el);
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  if (!name) return alert("Item name is required");
  const category = document.getElementById("category").value.trim();
  const price = document.getElementById("price").value;
  const user = document.getElementById("user").value.trim();
  const email = document.getElementById("email").value.trim();

  const body = { name, category, price: price || 0, user, email };

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err?.error || "Failed to add");
    }
    // clear form
    addForm.reset();
    loadItems();
  } catch (err) {
    alert("Could not add item: " + err.message);
  }
});

refreshBtn.addEventListener("click", loadItems);

// initial load
loadItems();
