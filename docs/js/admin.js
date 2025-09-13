const API = "http://localhost:3000";
const token = localStorage.getItem("token");

/*/////////////////////////////////////////////// Load Users ///////////////////////////////////////////////////*/
async function loadUsers() {
  try {
    const res = await fetch(`${API}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    let users = await res.json();

    users = users.map(u => ({
      ...u,
      isActive: u.isActive !== undefined ? u.isActive : true
    }));

    const tbody = document.querySelector("#usersTable tbody");
    tbody.innerHTML = users
      .map(
        u => `
        <tr>
          <td>${u.email}</td>
          <td>${u.role || "user"}</td>
          <td>${u.isActive ? "✅ Active" : "🚫 Banned"}</td>
          <td>
            <button class="ban-btn" onclick="toggleUserStatus(${u.id}, ${
          u.isActive
        })">
              ${u.isActive ? "Ban" : "Unban"}
            </button>
          </td>
        </tr>`
      )
      .join("");
  } catch (err) {
    console.error("Error loading users:", err);
  }
}

/*//////////////////////////////////////////////// Toggle User Status ///////////////////////////////////////////*/
async function toggleUserStatus(userId, isActive) {
  try {
    await fetch(`${API}/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ isActive: !isActive })
    });

    Swal.fire(
      "Updated",
      isActive ? "User has been banned 🚫" : "User has been unbanned ✅",
      "success"
    );

    loadUsers();
  } catch (err) {
    console.error("Error toggling user status:", err);
  }
}

/*/////////////////////////////////////////////////////// Load Campaigns ////////////////////////////////////////////////*/
async function loadCampaigns() {
  try {
    const res = await fetch(`${API}/campaigns`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const campaigns = await res.json();

/*///////////////////////////////////////////////////////////////// Pending Campaigns ////////////////////////////////////////////*/
    const pendingTbody = document.querySelector("#campaignsTable tbody");
    pendingTbody.innerHTML = campaigns
      .filter(c => !c.isApproved)
      .map(
        c => `
        <tr>
          <td>${c.title}</td>
          <td>${c.creatorId}</td>
          <td>$${c.goal}</td>
          <td>
            <button class="approve-btn" onclick="approveCampaign(${c.id}, true)">Approve</button>
            <button class="reject-btn" onclick="approveCampaign(${c.id}, false)">Reject</button>
            <button class="reject-btn" onclick="deleteCampaign(${c.id})">Delete</button>
          </td>
        </tr>`
      )
      .join("");

    const allTbody = document.querySelector("#allCampaignsTable tbody");
    allTbody.innerHTML = campaigns
      .map(
        c => `
        <tr>
          <td>${c.title}</td>
          <td>${c.creatorId}</td>
          <td>$${c.goal}</td>
          <td>${c.isApproved ? "✅ Approved" : " Pending"}</td>
        </tr>`
      )
      .join("");
  } catch (err) {
    console.error("Error loading campaigns:", err);
  }
}

/*////////////////////////////////////////////// Approve / Reject Campaign //////////////////////////////////////////////////////*/
async function approveCampaign(campaignId, isApproved) {
  try {
    await fetch(`${API}/campaigns/${campaignId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ isApproved })
    });

    Swal.fire(
      "Updated",
      isApproved ? "Campaign Approved ✅" : "Campaign Rejected ❌",
      isApproved ? "success" : "info"
    );

    loadCampaigns(); // refresh campaigns
  } catch (err) {
    console.error("Error approving campaign:", err);
  }
}

/*///////////////////////////////////////////////// Delete Campaign //////////////////////////////////////*/
async function deleteCampaign(campaignId) {
  try {
    await fetch(`${API}/campaigns/${campaignId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    Swal.fire("Deleted", "Campaign has been removed 🗑️", "success");
    loadCampaigns();
  } catch (err) {
    console.error("Error deleting campaign:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadUsers();
  loadCampaigns();
});
