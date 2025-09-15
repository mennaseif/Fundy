const API = "http://localhost:3000";
const token = localStorage.getItem("token");


/*////////////////////////////////////////////////////// Guard /////////////////////////////////////////////////////////////////*/
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) {
    Swal.fire({
      icon: "error",
      title: "Access Denied",
      text: "You must log in to access this page."
    }).then(() => {
      window.location.href = "login.html";
    });
    return;
  }

  if (window.location.pathname.includes("admin.html") && user.role !== "admin") {
    Swal.fire({
      icon: "error",
      title: "Unauthorized",
      text: "You do not have permission to access the Admin Dashboard."
    }).then(() => {
      window.location.href = "index.html";
    });
    return;
  }
});

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
          <td>${u.isActive ? " Active" : " Banned"}</td>
          <td>
            <button class="ban-btn" onclick="toggleUserStatus(${u.id}, ${u.isActive})">
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
      isActive ? "User has been banned " : "User has been unbanned ",
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
            <button class="approve-btn" onclick="approveCampaign(${c.id})">Approve</button>
            <button class="reject-btn" onclick="rejectCampaign(${c.id})">Reject</button>
          </td>
        </tr>`
      )
      .join("");

    /*///////////////////////////////////////////////////// All Campaigns /////////////////////////////////////////////////////*/
    const allTbody = document.querySelector("#allCampaignsTable tbody");
    allTbody.innerHTML = campaigns
      .map(
        c => `
        <tr>
          <td>${c.title}</td>
          <td>${c.creatorId}</td>
          <td>$${c.goal}</td>
          <td>${c.isApproved ? " Approved" : " Pending"}</td>
        </tr>`
      )
      .join("");
  } catch (err) {
    console.error("Error loading campaigns:", err);
  }
}

/*////////////////////////////////////////////// Approve Campaign //////////////////////////////////////////////////////*/
async function approveCampaign(campaignId) {
  if (!token) {
    Swal.fire("Unauthorized", "You must be logged in as admin.", "error");
    return;
  }

  const res = await fetch(`${API}/campaigns/${campaignId}`, {
    method: "PATCH",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ isApproved: true })
  });

  if (!res.ok) {
    Swal.fire("Error", "Could not approve campaign", "error");
    return;
  }

  Swal.fire("Approved ✅", "Campaign has been approved.", "success");

  loadCampaigns();
}

/*////////////////////////////////////////////// Reject Campaign //////////////////////////////////////////////*/
async function rejectCampaign(campaignId) {
  if (!token) {
    Swal.fire("Unauthorized", "You must be logged in as admin.", "error");
    return;
  }

  const confirm = await Swal.fire({
    title: "Reject Campaign?",
    text: "This will mark the campaign as rejected.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, reject it",
    cancelButtonText: "Cancel"
  });

  if (!confirm.isConfirmed) return;

  const res = await fetch(`${API}/campaigns/${campaignId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ isApproved: false, rejected: true })
  });

  if (!res.ok) {
    Swal.fire("Error", "Could not reject campaign", "error");
    return;
  }

  Swal.fire("Rejected ", "Campaign has been marked as rejected.", "success");
  loadCampaigns();
}

document.addEventListener("DOMContentLoaded", () => {
  loadUsers();
  loadCampaigns();
});
