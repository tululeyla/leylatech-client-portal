import { getClients, createClient, deleteClient, updateClientStatus } from "./api.js";
import { renderCard, renderClientList, removeCardFromDOM, updateBadgeUI } from "./ui.js";

const form = document.getElementById("add-client-form");
const nameInput = document.getElementById("engineerName");
const companyInput = document.getElementById("clientCompany");
const clientList = document.getElementById("engineer-list");

// 1. Initial GET Load
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const clients = await getClients();
    renderClientList(clients);
  } catch (error) {
    console.error("Failed to load clients:", error.message);
  }
});

// 2. Create Client (POST)
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const company = companyInput.value.trim() || "LeylaTech Partner";

  if (!name) return;

  try {
    const newClient = await createClient({ name, company: { name: company }, status: "Active" });
    renderCard(newClient);
    form.reset();
  } catch (error) {
    alert("Could not add client.");
  }
});

// 3. Event Delegation for DELETE and Status Toggle
clientList.addEventListener("click", async (e) => {
  const target = e.target;

  // Handle DELETE Click
  if (target.classList.contains("btn-delete")) {
    const clientId = target.getAttribute("data-id");
    target.disabled = true;
    target.textContent = "Deleting...";

    try {
      await deleteClient(clientId);
      removeCardFromDOM(clientId);
    } catch (error) {
      alert("Could not delete client.");
      target.disabled = false;
      target.textContent = "Delete";
    }
  }

  // Handle Status Badge Toggle Click
  if (target.classList.contains("status-toggle")) {
    const clientId = target.getAttribute("data-id");
    const currentStatus = target.textContent.trim();
    const nextStatus = currentStatus === "Active" ? "Pending" : "Active";

    try {
      await updateClientStatus(clientId, nextStatus);
      updateBadgeUI(clientId, nextStatus);
    } catch (error) {
      alert("Could not update status.");
    }
  }
});