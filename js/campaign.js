/*///////////////////////////////////////////////////////Vars////////////////////////////////////////////////////////*/
const API = "http://localhost:3000"; 
const campaignsDiv = document.getElementById("campaigns");
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "null");
const searchInput = document.getElementById("campaignSearch");
const categoryFilter = document.getElementById("categoryFilter");
const sortSelect = document.getElementById("sortCampaigns");

let allCampaigns = [];

/*///////////////////////////////////////////// Load Campaigns /////////////////////////////////////////////////////////////////*/
async function loadCampaigns() {
  let url = `${API}/campaigns`;

  if (!user || user.role !== "admin") {
    url += "?isApproved=true";
  }

  const res = await fetch(url);
  allCampaigns = await res.json();

  applyFiltersAndRender();
}

/*////////////////////////////////////////////////// Apply Filters + Sorting //////////////////////////////////////////////////////*/
function applyFiltersAndRender() {
  let filtered = [...allCampaigns];

  if (searchInput) {
    const term = searchInput.value.toLowerCase();
    if (term) {
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term)
      );
    }
  }

  if (categoryFilter && categoryFilter.value) {
    filtered = filtered.filter(c => c.category === categoryFilter.value);
  }

  if (sortSelect) {
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

/* ///////////////////////////////////////// Render Campaigns //////////////////////////////////////////////////////////*/
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
              <button class="approve-btn" onclick="approveCampaign(${c.id}, true)">Approve</button>
              <button class="reject-btn" onclick="approveCampaign(${c.id}, false)">Reject</button>
            `
            : c.isApproved 
              ? `<button class="pledge-btn" onclick="pledge(${c.id}, '${c.title}')">Pledge</button>`
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

  // Logged in → redirect to payment page
  window.location.href = `payment.html?id=${campaignId}&title=${encodeURIComponent(campaignTitle)}`;
}

if (searchInput) {
  searchInput.addEventListener("input", applyFiltersAndRender);
}

categoryFilter?.addEventListener("change", applyFiltersAndRender);
sortSelect?.addEventListener("change", applyFiltersAndRender);

/*//////////////////////////////////////////////// Approve / Reject (Admin only) ////////////////////////////////////////////////////*/

async function approveCampaign(campaignId, isApproved) {
  if (!token) {
    Swal.fire("Unauthorized", "You must be logged in as admin.", "error");
    return;
  }

  await fetch(`${API}/campaigns/${campaignId}`, {
    method: "PATCH",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ isApproved })
  });

  Swal.fire(
    "Updated",
    isApproved ? "Campaign Approved ✅" : "Campaign Rejected ❌",
    isApproved ? "success" : "info"
  );
  loadCampaigns();
}

loadCampaigns();
