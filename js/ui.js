const clientList = document.getElementById("engineer-list");

export function renderCard(client) {
  const companyName = client.company?.name || "LeylaTech Partner";
  const status = client.status || "Active";
  const badgeClass = status.toLowerCase() === "active" ? "badge-active" : "badge-pending";

  const cardHTML = `
    <div class="client-card" id="card-${client.id}">
      <div class="card-header">
        <h4>${client.name}</h4>
        <span class="badge ${badgeClass} status-toggle" data-id="${client.id}" style="cursor:pointer;">${status}</span>
      </div>
      <p class="company-sub">Company: ${companyName}</p>
      <p class="role-sub">Contact: client@leylatech.com</p>
      <button class="btn-delete" data-id="${client.id}">Delete</button>
    </div>
  `;
  clientList.insertAdjacentHTML("beforeend", cardHTML);
}

export function removeCardFromDOM(id) {
  const cardElement = document.getElementById(`card-${id}`);
  if (cardElement) {
    cardElement.remove();
  }
}

export function updateBadgeUI(id, newStatus) {
  const cardElement = document.getElementById(`card-${id}`);
  if (!cardElement) return;

  const badge = cardElement.querySelector(".badge");
  badge.textContent = newStatus;
  badge.className = `badge ${newStatus.toLowerCase() === "active" ? "badge-active" : "badge-pending"} status-toggle`;
}

export function renderClientList(clients) {
  clientList.innerHTML = "";
  if (clients.length === 0) {
    clientList.innerHTML = `<p class="empty-msg">No active clients found.</p>`;
    return;
  }
  clients.forEach((client) => renderCard(client));
}
// 1. Loading State Helper
export function showLoading(container) {
  if (!container) return;
  container.innerHTML = `
    <div class="loading-state" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b; font-weight: 500;">
      <p style="font-size: 1.1rem; margin-bottom: 4px;">🔄 Loading client dashboard...</p>
      <p style="font-size: 0.85rem;">Please wait while we sync with the server.</p>
    </div>
  `;
}

// 2. Empty Search Fallback Helper
export function renderEmptyState(container, message = "No items found.") {
  if (!container) return;
  container.innerHTML = `
    <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b;">
      <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 4px;">📭 ${message}</p>
      <p style="font-size: 0.9rem;">Try searching for a different keyword or adding a new record.</p>
    </div>
  `;
}