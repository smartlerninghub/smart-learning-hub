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

const registrationForm = document.getElementById("registrationForm");
const registrationSubmit = document.getElementById("registrationSubmit");
const registrationStatus = document.getElementById("registrationStatus");
const consentCheckbox = registrationForm.querySelector('input[name="consent"]');

// Make the Submit button disabled until the consent box is checked
function updateSubmitButton() {
  registrationSubmit.disabled = !consentCheckbox.checked;
}

// Run once when the page loads
updateSubmitButton();

// Update every time the user ticks or unticks the box
consentCheckbox.addEventListener("change", updateSubmitButton);

function databaseClient() {
  const url = window.SMART_LEARNING_HUB_SUPABASE_URL;
  const key = window.SMART_LEARNING_HUB_SUPABASE_KEY;
  if (!window.supabase || !url || !key || url.includes("PASTE_YOUR_") || key.includes("PASTE_YOUR_")) {
    return null;
  }
  if (!window.smartLearningHubSupabaseClient) {
    window.smartLearningHubSupabaseClient = window.supabase.createClient(url, key);
  }
  return window.smartLearningHubSupabaseClient;
}

registrationForm.addEventListener("submit", async event => {
  event.preventDefault();

  // Extra safety – do not allow submission without consent
  if (!consentCheckbox.checked) {
    registrationStatus.textContent = "Please tick the consent box to continue.";
    showToast("You must agree to the consent statement.");
    return;
  }

  registrationStatus.textContent = "";
  const client = databaseClient();
  if (!client) {
    registrationStatus.textContent = "Database setup is not complete yet. Please contact Smart Learning Hub on WhatsApp while the website owner finishes setup.";
    showToast("Database connection is not configured yet.");
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
    consent_to_store: data.get("consent") === "on"
  };

  registrationSubmit.disabled = true;
  registrationSubmit.textContent = "Saving registration…";

  try {
    const { error } = await client.from("student_registrations").insert([record]);
    if (error) throw error;
    registrationStatus.textContent = "Thank you! Your registration has been saved. Smart Learning Hub will contact you using the details provided.";
    showToast("Registration saved successfully.");
    registrationForm.reset();
    updateSubmitButton(); // disable the button again after successful reset
  } catch (error) {
    console.error("Registration save failed:", error);
    registrationStatus.textContent = "We could not save your registration. Please check your internet connection and try again, or contact us on WhatsApp.";
    showToast("Registration was not saved. Please try again.");
  } finally {
    registrationSubmit.disabled = !consentCheckbox.checked;
    registrationSubmit.textContent = "Submit registration";
  }
});

document.getElementById("contactWhatsApp").href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello Smart Learning Hub, I would like to enquire about your services.")}`;
document.getElementById("year").textContent = new Date().getFullYear();

document.getElementById("menuToggle").addEventListener("click", () => {
  document.getElementById("mainNav").classList.toggle("open");
});
document.querySelectorAll("#mainNav a").forEach(link => {
  link.addEventListener("click", () => document.getElementById("mainNav").classList.remove("open"));
});
