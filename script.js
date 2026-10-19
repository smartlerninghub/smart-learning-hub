
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
const registrationForm = document.getElementById("registrationForm");
const registrationSubmit = document.getElementById("registrationSubmit");
const registrationStatus = document.getElementById("registrationStatus");

if (registrationForm && registrationSubmit && registrationStatus) {
  const consentCheckbox = registrationForm.querySelector(
    'input[name="consent"]'
  );

  function updateSubmitButton() {
    registrationSubmit.disabled = !consentCheckbox || !consentCheckbox.checked;
  }

  updateSubmitButton();

  if (consentCheckbox) {
    consentCheckbox.addEventListener("change", updateSubmitButton);
  }

  function databaseClient() {
    const url = window.SMART_LEARNING_HUB_SUPABASE_URL;
    const key = window.SMART_LEARNING_HUB_SUPABASE_KEY;

    if (
      !window.supabase ||
      !url ||
      !key ||
      url.includes("PASTE_YOUR_") ||
      key.includes("PASTE_YOUR_")
    ) {
      return null;
    }

    if (!window.smartLearningHubSupabaseClient) {
      window.smartLearningHubSupabaseClient =
        window.supabase.createClient(url, key);
    }

    return window.smartLearningHubSupabaseClient;
  }

  registrationForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!consentCheckbox || !consentCheckbox.checked) {
      registrationStatus.textContent =
        "Please agree to the data-storage statement before submitting.";
      showToast("Please tick the consent box.");
      return;
    }

    const client = databaseClient();

    if (!client) {
      registrationStatus.textContent =
        "Registration saving is not configured yet. Please contact Smart Learning Hub on WhatsApp.";
      showToast("Database connection is not configured.");
      return;
    }

    const data = new FormData(registrationForm);

    const record = {
      student_name: String(data.get("studentName") || "").trim(),
      guardian_name: String(data.get("guardianName") || "").trim() || null,
      phone: String(data.get("phone") || "").trim(),
      email: String(data.get("email") || "").trim() || null,
      level: String(data.get("level") || "").trim(),
      learning_mode: String(data.get("mode") || "").trim(),
      subjects: String(data.get("subjects") || "").trim(),
      consent_to_store: true
    };

    if (
      !record.student_name ||
      !record.phone ||
      !record.level ||
      !record.learning_mode ||
      !record.subjects
    ) {
      registrationStatus.textContent =
        "Please complete all required fields before submitting.";
      return;
    }

    registrationSubmit.disabled = true;
    registrationSubmit.textContent = "Saving registration…";
    registrationStatus.textContent = "";

    const { data, error } = await client
  .from("student_registrations")
  .insert([record])
  .select("id");

if (error) throw error;

if (!data || data.length === 0) {
  throw new Error(
    "The insert returned no row. Check the database response and policies."
  );
}

console.log("Registration insert confirmed:", data);

      registrationStatus.textContent =
        "Thank you! Your registration has been saved. Smart Learning Hub will contact you using the details provided.";
      showToast("Registration saved successfully.");

      registrationForm.reset();
    } catch (error) {
      console.error("Registration save failed:", error);
      registrationStatus.textContent =
        "We could not save your registration. Please try again or contact us on WhatsApp.";
      showToast("Registration was not saved. Please try again.");
    } finally {
      registrationSubmit.textContent = "Submit registration";
      updateSubmitButton();
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
