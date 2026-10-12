// Smart Learning Hub starter website.
// IMPORTANT: Change this number if your business WhatsApp number changes.
// Use country code 254 and omit the leading zero: 0798662123 -> 254798662123.
const WHATSAPP_NUMBER = "254798662123";

const order = new Map();
const orderSummary = document.getElementById("orderSummary");
const orderTotal = document.getElementById("orderTotal");
const toast = document.getElementById("toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2800);
}

function openWhatsApp(message) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function updateOrder() {
  const items = [...order.entries()];
  if (!items.length) {
    orderSummary.textContent = "No items selected yet.";
    orderTotal.textContent = "Total: KSh 0";
    return;
  }
  const total = items.reduce((sum, [, item]) => sum + item.price * item.quantity, 0);
  orderSummary.textContent = items.map(([name, item]) => `${name} × ${item.quantity} (KSh ${item.price * item.quantity})`).join(" · ");
  orderTotal.textContent = `Total: KSh ${total.toLocaleString("en-KE")}`;
}

document.querySelectorAll(".add-order").forEach(button => {
  button.addEventListener("click", () => {
    const name = button.dataset.product;
    const price = Number(button.dataset.price);
    const current = order.get(name) || { price, quantity: 0 };
    current.quantity += 1;
    order.set(name, current);
    updateOrder();
    showToast(`${name} added to your order.`);
  });
});

document.getElementById("checkoutButton").addEventListener("click", () => {
  if (!order.size) {
    showToast("Please select at least one item first.");
    return;
  }
  const lines = [...order.entries()].map(([name, item]) => `- ${name} x ${item.quantity}: KSh ${item.price * item.quantity}`);
  const total = [...order.values()].reduce((sum, item) => sum + item.price * item.quantity, 0);
  openWhatsApp(`Hello Smart Learning Hub, I would like to order:\n${lines.join("\n")}\nTotal shown: KSh ${total}\nPlease confirm availability, final price and payment instructions.`);
});

document.getElementById("registrationForm").addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const fields = [
    ["Student name", data.get("studentName")],
    ["Parent/guardian", data.get("guardianName") || "Not provided"],
    ["Phone", data.get("phone")],
    ["Email", data.get("email") || "Not provided"],
    ["Level", data.get("level")],
    ["Learning mode", data.get("mode")],
    ["Subjects/support", data.get("subjects")]
  ];
  const message = "Hello Smart Learning Hub, I would like to register for tuition.\n\n" +
    fields.map(([label, value]) => `${label}: ${value}`).join("\n") +
    "\n\nPlease contact me with the next steps.";
  openWhatsApp(message);
});

document.getElementById("contactWhatsApp").href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello Smart Learning Hub, I would like to enquire about your services.")}`;
document.getElementById("year").textContent = new Date().getFullYear();

document.getElementById("menuToggle").addEventListener("click", () => {
  document.getElementById("mainNav").classList.toggle("open");
});
document.querySelectorAll("#mainNav a").forEach(link => {
  link.addEventListener("click", () => document.getElementById("mainNav").classList.remove("open"));
});
