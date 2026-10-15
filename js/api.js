const BASE_URL = "https://jsonplaceholder.typicode.com/users";

export async function getClients() {
  const response = await fetch(BASE_URL);
  if (!response.ok) throw new Error(`Fetch error: ${response.status}`);
  return await response.json();
}

export async function createClient(clientData) {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(clientData),
  });
  if (!response.ok) throw new Error(`Create error: ${response.status}`);
  return await response.json();
}

export async function deleteClient(id) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error(`Delete error: ${response.status}`);
}

export async function updateClientStatus(id, newStatus) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: newStatus }),
  });
  if (!response.ok) throw new Error(`Update error: ${response.status}`);
  return await response.json();
}