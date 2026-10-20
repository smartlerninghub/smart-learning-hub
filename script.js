
"use strict";

// Smart Learning Hub
const WHATSAPP_NUMBER = "254798662123";

// ---------- Shared helpers ----------
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2800);
}

function openWhatsApp(message) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

// ---------- Product ordering ----------
const order = new Map();
const orderSummary = document.getElementById("orderSummary");
const orderTotal = document.getElementById("orderTotal");

function updateOrder() {
  if (!orderSummary || !orderTotal) return;

  const items = [...order.entries()];

  if (!items.length) {
    orderSummary.textContent = "No items selected yet.";
    orderTotal.textContent = "Total: KSh 0";
    return;
  }

  const total = items.reduce(
    (sum, [, item]) => sum + item.price * item.quantity, 0
  );

  orderSummary.textContent = items
    .map(([name, item]) =>
      `${name} × ${item.quantity} (KSh ${item.price * item.quantity})`
    )
    .join(" · ");

  orderTotal.textContent = `Total: KSh ${total.toLocaleString("en-KE")}`;
}

document.querySelectorAll(".add-order").forEach(button => {
  button.addEventListener("click", () => {
    const name = button.dataset.product;
    const price = Number(button.dataset.price);

    if (!name || !Number.isFinite(price)) {
      showToast("This product could not be added. Please try again.");
      return;
    }

    const current = order.get(name) || { price, quantity: 0 };
    current.quantity += 1;
    order.set(name, current);

    updateOrder();
    showToast(`${name} added to your order.`);
  });
});

const checkoutButton = document.getElementById("checkoutButton");

if (checkoutButton) {
  checkoutButton.addEventListener("click", () => {
    if (!order.size) {
      showToast("Please select at least one item first.");
      return;
    }

    const lines = [...order.entries()].map(([name, item]) =>
      `- ${name} x ${item.quantity}: KSh ${item.price * item.quantity}`
    );

    const total = [...order.values()].reduce(
      (sum, item) => sum + item.price * item.quantity, 0
    );

    openWhatsApp(
      `Hello Smart Learning Hub, I would like to order:\n` +
      `${lines.join("\n")}\nTotal shown: KSh ${total}\n` +
      "Please confirm availability, final price and payment instructions."
    );
  });
}

updateOrder();

// ---------- Supabase registration ----------

 // ---------- WhatsApp registration ----------
const registrationForm = document.getElementById("registrationForm");
const registrationSubmit = document.getElementById("registrationSubmit");
const registrationStatus = document.getElementById("registrationStatus");

if (registrationForm && registrationSubmit && registrationStatus) {
  const consentCheckbox = registrationForm.querySelector(
    'input[name="consent"]'
  );

  function updateSubmitButton() {
    registrationSubmit.disabled =
      !consentCheckbox || !consentCheckbox.checked;
  }

  updateSubmitButton();

  if (consentCheckbox) {
    consentCheckbox.addEventListener("change", updateSubmitButton);
  }

  registrationForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!consentCheckbox || !consentCheckbox.checked) {
      registrationStatus.textContent =
        "Please tick the consent box before registering.";
      return;
    }

    if (!registrationForm.reportValidity()) return;

    const data = new FormData(registrationForm);

    const studentName = String(data.get("studentName") || "").trim();
    const guardianName = String(data.get("guardianName") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const email = String(data.get("email") || "").trim();
    const level = String(data.get("level") || "").trim();
    const mode = String(data.get("mode") || "").trim();
    const subjects = String(data.get("subjects") || "").trim();

    const message = [
      "Hello Smart Learning Hub!",
      "I would like to register for learning services.",
      "",
      `Student name: ${studentName}`,
      `Parent/Guardian: ${guardianName || "Not provided"}`,
      `Phone: ${phone}`,
      `Email: ${email || "Not provided"}`,
      `Class/Level: ${level}`,
      `Learning mode: ${mode}`,
      `Subjects: ${subjects}`,
      "",
      "I agree to share these details with Smart Learning Hub through WhatsApp."
    ].join("\n");

    const whatsappURL =
      "https://wa.me/254798662123?text=" +
      encodeURIComponent(message);

    const whatsappWindow = window.open(
      whatsappURL,
      "_blank",
      "noopener,noreferrer"
    );

    registrationStatus.textContent =
      "WhatsApp is opening. Please press Send in WhatsApp to complete your registration.";

    if (!whatsappWindow) {
      registrationStatus.textContent =
        "Your browser may have blocked WhatsApp. Allow pop-ups or open WhatsApp using the contact link on this page.";
    }
  });
}


// ---------- Contact and navigation ----------
const contactWhatsApp = document.getElementById("contactWhatsApp");

if (contactWhatsApp) {
  contactWhatsApp.href =
    `https://wa.me/${WHATSAPP_NUMBER}?text=` +
    encodeURIComponent(
      "Hello Smart Learning Hub, I would like to enquire about your services."
    );
}

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    mainNav.classList.toggle("open");
  });

  mainNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => mainNav.classList.remove("open"));
  });
}
