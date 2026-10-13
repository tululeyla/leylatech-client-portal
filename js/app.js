import { getClients, createClient, deleteClient, updateClientStatus } from "./api.js";
import { renderCard, renderClientList, removeCardFromDOM, updateBadgeUI } from "./ui.js";

const form = document.getElementById("add-client-form");
const nameInput = document.getElementById("engineerName");
const companyInput = document.getElementById("clientCompany");
const clientList = document.getElementById("engineer-list");
const searchInput = document.querySelector(".search-bar input");

let allClients = [];
const STORAGE_KEY = "leylatech_clients_v1";

// 1. Load Initial Data (Check LocalStorage first, fallback to API)
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const savedClients = localStorage.getItem(STORAGE_KEY);
    
    if (savedClients) {
      // Load from browser memory if available
      allClients = JSON.parse(savedClients);
    } else {
      // Otherwise fetch from API and save to localStorage
      allClients = await getClients();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allClients));
    }
    
    renderClientList(allClients);
  } catch (error) {
    console.error("Failed to load clients:", error.message);
  }
});

// Helper function to sync local state to localStorage
function saveToLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allClients));
}

// 2. Real-Time Search Filter Logic
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();

    const filteredClients = allClients.filter((client) => {
      const nameMatch = client.name.toLowerCase().includes(query);
      const companyMatch = (client.company?.name || "").toLowerCase().includes(query);
      return nameMatch || companyMatch;
    });

    renderClientList(filteredClients);
  });
}

// 3. Create Client (POST & LocalStorage Save)
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const company = companyInput.value.trim() || "LeylaTech Partner";

  if (!name) return;

  try {
    // Optional: Call API (simulated)
    const newClient = await createClient({ name, company: { name: company }, status: "Active" });
    
    // Ensure unique ID if offline/local
    newClient.id = Date.now(); 

    allClients.unshift(newClient);
    saveToLocalStorage(); // Save to browser storage
    
    renderCard(newClient);
    form.reset();
  } catch (error) {
    alert("Could not add client.");
  }
});

// 4. Event Delegation for DELETE and Status Toggle
clientList.addEventListener("click", async (e) => {
  const target = e.target;

  // Handle DELETE Click
  if (target.classList.contains("btn-delete")) {
    const clientId = target.getAttribute("data-id");
    target.disabled = true;
    target.textContent = "Deleting...";

    try {
      await deleteClient(clientId);
      
      allClients = allClients.filter(c => String(c.id) !== String(clientId));
      saveToLocalStorage(); // Update storage
      removeCardFromDOM(clientId);
    } catch (error) {
      // Even if mock API fails, remove locally for smooth UX
      allClients = allClients.filter(c => String(c.id) !== String(clientId));
      saveToLocalStorage();
      removeCardFromDOM(clientId);
    }
  }

  // Handle Status Badge Toggle Click
  if (target.classList.contains("status-toggle")) {
    const clientId = target.getAttribute("data-id");
    const currentStatus = target.textContent.trim();
    const nextStatus = currentStatus === "Active" ? "Pending" : "Active";

    try {
      await updateClientStatus(clientId, nextStatus);
      
      const clientObj = allClients.find(c => String(c.id) === String(clientId));
      if (clientObj) {
        clientObj.status = nextStatus;
        saveToLocalStorage(); // Update storage
      }

      updateBadgeUI(clientId, nextStatus);
    } catch (error) {
      alert("Could not update status.");
    }
  }
});