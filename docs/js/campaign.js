const API = "http://localhost:3000"; 
const campaignsDiv = document.getElementById("campaigns");
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "null");
const searchInput = document.getElementById("campaignSearch");
const categoryFilter = document.getElementById("categoryFilter");
const sortSelect = document.getElementById("sortCampaigns");

let allCampaigns = [];

/*///////////////////////////////////////////// Load Campaigns //////////////////////////////////////////////////////*/
async function loadCampaigns() {
  let url = `${API}/campaigns`;

  if (!user || user.role !== "admin") {
    url += "?isApproved=true";
  }

  const res = await fetch(url);
  allCampaigns = await res.json();

  // Remove expired and finished campaigns
  const today = new Date().toISOString().split("T")[0];
  allCampaigns = allCampaigns.filter(c => {
    const raised = c.pledges ? c.pledges.reduce((sum, p) => sum + p.amount, 0) : 0;
    return raised < c.goal && (!c.deadline || c.deadline >= today);
  });

  applyFiltersAndRender();
}

/*////////////////////////////////////////////////// Apply Filters + Sorting //////////////////////////////////////////*/
function applyFiltersAndRender() {
  let filtered = [...allCampaigns];

  // Search
  if (searchInput && searchInput.value.trim()) {
  const term = searchInput.value.toLowerCase().trim();
  const keywords = term.split(/\s+/); 

  filtered = filtered.filter(c => {
    const text = `${c.title} ${c.description} ${c.category || ""}`.toLowerCase();
    return keywords.every(kw => text.includes(kw));
  });
}


  // Category
  if (categoryFilter && categoryFilter.value) {
    filtered = filtered.filter(c => c.category === categoryFilter.value);
  }

  // Sorting
  if (sortSelect && sortSelect.value) {
    if (sortSelect.value === "goalAsc") {
      filtered.sort((a, b) => a.goal - b.goal);
    } else if (sortSelect.value === "goalDesc") {
      filtered.sort((a, b) => b.goal - a.goal);
    } else if (sortSelect.value === "raised") {
      filtered.sort((a, b) => {
        const raisedA = a.pledges ? a.pledges.reduce((sum, p) => sum + p.amount, 0) : 0;
        const raisedB = b.pledges ? b.pledges.reduce((sum, p) => sum + p.amount, 0) : 0;
        return raisedB - raisedA;
      });
    }
  }

  renderCampaigns(filtered);
}

/* ///////////////////////////////////////// Render Campaigns //////////////////////////////////////////////////////*/
function renderCampaigns(campaigns) {
  if (!campaigns.length) {
    campaignsDiv.innerHTML = "<p>No campaigns available.</p>";
    return;
  }

  campaignsDiv.innerHTML = campaigns.map(c => {
    const raised = c.pledges ? c.pledges.reduce((sum, p) => sum + p.amount, 0) : 0;
    const progress = Math.min((raised / c.goal) * 100, 100);

    return `
      <div class="campaign-card">
        <img src="${c.image}" alt="${c.title}">
        <div class="campaign-content">
          <h3>${c.title}</h3>
          <p>${c.description}</p>
          <p><strong>Category:</strong> ${c.category || "Uncategorized"}</p>

          <div class="progress-bar">
            <div class="progress" style="width: ${progress}%;"></div>
          </div>
          <p><strong>Goal:</strong> $${c.goal} | <strong>Raised:</strong> $${raised}</p>

          ${user && user.role === "admin" 
            ? `
              <p><strong>Status:</strong> ${c.isApproved ? "✅ Approved" : " Pending"}</p>
              ${c.isApproved 
                ? `<button class="delete-btn" onclick="deleteCampaign(${c.id})">Delete</button>` 
                : `
                  <button class="approve-btn" onclick="approveCampaign(${c.id}, true)">Approve</button>
                  <button class="reject-btn" onclick="deleteCampaign(${c.id})">Reject</button>
                `
              }
            `
            : c.isApproved 
              ? `<a href="payment.html?id=${c.id}&title=${encodeURIComponent(c.title)}" class="pledge-btn">Pledge</a>`
              : "<p> Waiting for approval</p>"
          }
        </div>
      </div>
    `;
  }).join("");
}

/*///////////////////////////////////////////////// Pledge Button ////////////////////////////////////////////////*/
function pledge(campaignId, campaignTitle) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) {
    Swal.fire({
      icon: "warning",
      title: "Login Required",
      text: "You must log in before pledging to a campaign."
    }).then(() => {
      window.location.href = "login.html";
    });
    return;
  }

  window.location.href = `payment.html?id=${campaignId}&title=${encodeURIComponent(campaignTitle)}`;
}

/*//////////////////////////////////////////////// Approve //////////////////////////////////*/
async function approveCampaign(campaignId, isApproved) {
  if (!token || !user || user.role !== "admin") {
    Swal.fire("Unauthorized", "You must be logged in as admin.", "error");
    return;
  }

  const res = await fetch(`${API}/campaigns/${campaignId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ isApproved })
  });

  if (!res.ok) {
    Swal.fire("Error", "Could not update campaign", "error");
    return;
  }

  Swal.fire(
    "Updated",
    isApproved ? "Campaign Approved " : "Campaign Rejected ",
    isApproved ? "success" : "info"
  );

  loadCampaigns();
}

/*//////////////////////////////////////////////// Delete Campaign ////////////////////////////////////*/
async function deleteCampaign(campaignId) {
  if (!token || !user || user.role !== "admin") {
    Swal.fire("Unauthorized", "You must be logged in as admin.", "error");
    return;
  }

  const confirm = await Swal.fire({
    title: "Are you sure?",
    text: "This campaign will be permanently deleted.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it",
    cancelButtonText: "Cancel"
  });

  if (!confirm.isConfirmed) return;

  const res = await fetch(`${API}/campaigns/${campaignId}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  });

  if (!res.ok) {
    Swal.fire("Error", "Could not delete campaign", "error");
    return;
  }

  Swal.fire("Deleted", "Campaign has been removed.", "success");

  loadCampaigns();
}

document.addEventListener("DOMContentLoaded", () => {
  loadCampaigns();

  searchInput?.addEventListener("input", applyFiltersAndRender);
  categoryFilter?.addEventListener("change", applyFiltersAndRender);
  sortSelect?.addEventListener("change", applyFiltersAndRender);
});
