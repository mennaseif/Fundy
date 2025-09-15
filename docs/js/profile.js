const API = "http://localhost:3000";
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "null");
const profileCampaignsDiv = document.getElementById("profileCampaigns");

/*/////////////////////////////////////////////////// Guard ////////////////////////////////////////////////////////*/
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
});

/*///////////////////////////////////////////////////////// Create Campaign ////////////////////////////////////////////////////*/
const createForm = document.getElementById("createForm");

if (createForm) {
  createForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!token) {
      Swal.fire("Login Required", "Please log in to create a campaign.", "warning");
      return;
    }

    const file = document.getElementById("image").files[0];
    let base64 = null;
    if (file) {
      base64 = await toBase64(file);
    }

    const campaign = {
      title: document.getElementById("title").value,
      description: document.getElementById("description").value,
      goal: parseInt(document.getElementById("goal").value),
      deadline: document.getElementById("deadline").value,
      creatorId: user.id,
      isApproved: false, 
      category: document.getElementById("category").value,
    };

    if (base64) campaign.image = base64;

    const res = await fetch(`${API}/campaigns`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(campaign)
    });

    if (res.ok) {
      Swal.fire("Created!", "Your campaign was created and is waiting for admin approval.", "success");
      createForm.reset();
      loadProfileCampaigns();
    } else {
      Swal.fire("Error", "Could not create campaign", "error");
    }
  });
}

// Convert file to Base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
  });
}

/*/////////////////////////////////////////////////////////Approved Campaign//////////////////////////////////*/
async function loadProfileCampaigns() {
  try {
    const res = await fetch(`${API}/campaigns?creatorId=${user.id}&isApproved=true`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const campaigns = await res.json();

    if (!campaigns.length) {
      profileCampaignsDiv.innerHTML = `<p class="empty-message"> You have no approved campaigns yet.</p>`;
      return;
    }

    profileCampaignsDiv.innerHTML = campaigns.map(c => {
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
              <div class="progress" style="width:${progress}%;"></div>
            </div>
            <p><strong>Goal:</strong> $${c.goal} | <strong>Raised:</strong> $${raised}</p>
            <p><strong>Deadline:</strong> ${c.deadline}</p>

            <div class="campaign-actions">
              <button class="edit-btn" onclick="editCampaign(${c.id}, ${c.goal}, '${c.deadline}')"> Edit</button>
              <button class="delete-btn" onclick="deleteCampaign(${c.id})"> Delete</button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  } catch (err) {
    console.error("Error loading campaigns:", err);
    profileCampaignsDiv.innerHTML = `<p class="empty-message"> Error loading campaigns.</p>`;
  }
}
/*//////////////////////////////////////////////////////// Edit Campaign /////////////////////////////////////////////////*/
async function editCampaign(id, currentGoal, currentDeadline) {
  const { value: formValues } = await Swal.fire({
    title: "Edit Campaign",
    html: `
      <input id="editGoal" type="number" class="swal2-input" value="${currentGoal}" placeholder="Goal ($)">
      <input id="editDeadline" type="date" class="swal2-input" value="${currentDeadline}">
    `,
    focusConfirm: false,
    preConfirm: () => {
      const newGoal = parseInt(document.getElementById("editGoal").value);
      const newDeadline = document.getElementById("editDeadline").value;

      if (!newGoal || newGoal <= 0) {
        Swal.showValidationMessage("Please enter a valid goal");
        return false;
      }
      if (!newDeadline) {
        Swal.showValidationMessage("Please choose a valid deadline");
        return false;
      }

      return { newGoal, newDeadline };
    }
  });

  if (!formValues) return;

  const res = await fetch(`${API}/campaigns/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      goal: formValues.newGoal,
      deadline: formValues.newDeadline
    })
  });

  if (!res.ok) {
    Swal.fire("Error", "Could not update campaign", "error");
    return;
  }

  const card = document.querySelector(`.campaign-card button[onclick*="editCampaign(${id},"]`)?.closest(".campaign-card");
  if (card) {
    const goalEl = card.querySelector("p strong:nth-child(1)").parentNode;
    const deadlineEl = card.querySelector("p:nth-of-type(3)");

    const raisedText = goalEl.textContent.match(/Raised:\s*\$([0-9]+)/);
    const raised = raisedText ? parseInt(raisedText[1]) : 0;

    goalEl.innerHTML = `<strong>Goal:</strong> $${formValues.newGoal} | <strong>Raised:</strong> $${raised}`;
    deadlineEl.innerHTML = `<strong>Deadline:</strong> ${formValues.newDeadline}`;

    const progress = Math.min((raised / formValues.newGoal) * 100, 100);
    card.querySelector(".progress").style.width = `${progress}%`;
  }

  Swal.fire("Updated", "Your campaign was updated successfully.", "success");
}

/*///////////////////////////////////////////////////////// Delete Campaign ////////////////////////////////////////////////////*/
async function deleteCampaign(id) {
  const confirm = await Swal.fire({
    title: "Are you sure?",
    text: "This will permanently delete your campaign.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it",
    cancelButtonText: "Cancel"
  });

  if (!confirm.isConfirmed) return;

  await fetch(`${API}/campaigns/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  Swal.fire("Deleted", "Your campaign has been removed.", "success");
  loadProfileCampaigns();
}

/*/////////////////////////////////////////////////////// Load User Pledges ///////////////////////////////////////////////////////*/
async function loadUserPledges() {
  try {
    const pledgesDiv = document.getElementById("userPledges");
    const res = await fetch(`${API}/campaigns`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const campaigns = await res.json();

    const userPledges = [];
    campaigns.forEach(c => {
      if (c.pledges) {
        c.pledges.forEach(p => {
          if (p.userId === user.id) {
            userPledges.push({
              campaign: c,
              pledge: p
            });
          }
        });
      }
    });

    if (!userPledges.length) {
      pledgesDiv.innerHTML = `<p class="empty-message"> You have not pledged to any campaigns yet.</p>`;
      return;
    }

    pledgesDiv.innerHTML = userPledges
      .map(up => {
        const c = up.campaign;
        const p = up.pledge;
        return `
          <div class="pledge-card">
            <h4>${c.title}</h4>
            <p><strong>Amount:</strong> $${p.amount}</p>
            <p><strong>Method:</strong> ${p.paymentMethod}</p>
            <p><strong>Date:</strong> ${p.date}</p>
          </div>
        `;
      })
      .join("");
  } catch (err) {
    console.error("Error loading pledges:", err);
    document.getElementById("userPledges").innerHTML =
      `<p class="empty-message"> Error loading pledges.</p>`;
  }
}

loadProfileCampaigns();
loadUserPledges();

