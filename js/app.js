import { getClients, createClient, deleteClient, updateClientStatus } from "./api.js";
import { renderCard, renderClientList, removeCardFromDOM, updateBadgeUI } from "./ui.js";

const form = document.getElementById("add-client-form");
const nameInput = document.getElementById("engineerName");
const companyInput = document.getElementById("clientCompany");
const clientList = document.getElementById("engineer-list");
const searchInput = document.querySelector(".search-bar input");

let allClients = [];
const STORAGE_KEY = "leylatech_clients_v1";

// Helper function to safely write state to LocalStorage
function saveToLocalStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allClients));
  } catch (error) {
    console.error("Failed to write to localStorage:", error.message);
  }
}

// 1. Safe Initialization with Error Boundary Logic
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const savedClients = localStorage.getItem(STORAGE_KEY);
    
    if (savedClients) {
      try {
        // Safe parsing: If JSON is corrupt, this will throw to catch block
        allClients = JSON.parse(savedClients);
      } catch (parseError) {
        console.warn("Corrupted JSON in localStorage. Resetting cache from API...", parseError.message);
        localStorage.removeItem(STORAGE_KEY);
        allClients = await getClients();
        saveToLocalStorage();
      }
    } else {
      // Fetch from API if no local storage exists
      allClients = await getClients();
      saveToLocalStorage();
    }
    
    renderClientList(allClients);
  } catch (error) {
    console.error("Critical API or Storage Error:", error.message);
    
    // UI Graceful Fallback: Render error banner instead of a blank screen
    if (clientList) {
      clientList.innerHTML = `
        <div class="error-banner" style="grid-column: 1/-1; padding: 20px; background: #fee2e2; color: #991b1b; border-radius: 8px; text-align: center;">
          <p style="font-weight: bold; margin-bottom: 4px;">⚠️ Unable to sync client dashboard</p>
          <p style="font-size: 0.9rem;">Please check your internet connection or try again later.</p>
        </div>
      `;
    }
  }
});

// 2. Real-Time Search Filter
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

// 3. Create Client (POST & Resilient Save)
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const company = companyInput.value.trim() || "LeylaTech Partner";

    if (!name) return;

    try {
      const newClient = await createClient({ name, company: { name: company }, status: "Active" });
      newClient.id = Date.now(); // Ensure unique ID locally

      allClients.unshift(newClient);
      saveToLocalStorage();
      
      renderCard(newClient);
      form.reset();
    } catch (error) {
      alert("Network issue: Could not persist client to server, but saved locally.");
    }
  });
}

// 4. Event Delegation for DELETE and Status Toggle
if (clientList) {
  clientList.addEventListener("click", async (e) => {
    const target = e.target;

    // Handle DELETE
    if (target.classList.contains("btn-delete")) {
      const clientId = target.getAttribute("data-id");
      target.disabled = true;
      target.textContent = "Deleting...";

      try {
        await deleteClient(clientId);
      } catch (error) {
        console.warn("API delete failed, proceeding with local DOM removal...");
      } finally {
        allClients = allClients.filter(c => String(c.id) !== String(clientId));
        saveToLocalStorage();
        removeCardFromDOM(clientId);
      }
    }

    // Handle Status Toggle
    if (target.classList.contains("status-toggle")) {
      const clientId = target.getAttribute("data-id");
      const currentStatus = target.textContent.trim();
      const nextStatus = currentStatus === "Active" ? "Pending" : "Active";

      try {
        await updateClientStatus(clientId, nextStatus);
      } catch (error) {
        console.warn("API status update failed, saving locally...");
      } finally {
        const clientObj = allClients.find(c => String(c.id) === String(clientId));
        if (clientObj) {
          clientObj.status = nextStatus;
          saveToLocalStorage();
        }
        updateBadgeUI(clientId, nextStatus);
      }
    }
  });
}