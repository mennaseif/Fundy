const API = "http://localhost:3000";
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!token || !user) {
  Swal.fire("Unauthorized", "Please login first.", "error").then(() => {
    window.location.href = "login.html";
  });
}

/*/////////////////////////////////////////////////// Update Profile //////////////////////////////////////////////////*/
document.getElementById("profileForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const updatedUser = {
    name: document.getElementById("profileName").value,
    email: document.getElementById("profileEmail").value
  };

  try {
    const res = await fetch(`${API}/users/${user.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(updatedUser)
    });

    if (!res.ok) throw new Error("Update failed");

    const data = await res.json();
    localStorage.setItem("user", JSON.stringify(data));

    Swal.fire("Profile Updated ✅", "Your info has been saved.", "success");
  } catch (err) {
    console.error("Profile update error:", err);
    Swal.fire("Error", "Could not update profile", "error");
  }
});

/*/////////////////////////////////////////////////// Load User Campaigns /////////////////////////////////////*/
async function loadUserCampaigns() {
  const campaignsDiv = document.getElementById("userCampaigns");
  const res = await fetch(`${API}/campaigns?creatorId=${user.id}&isApproved=true`);
  const campaigns = await res.json();

  if (!campaigns.length) {
    campaignsDiv.innerHTML = "<p>No approved campaigns yet.</p>";
    return;
  }

  campaignsDiv.innerHTML = campaigns.map(c => `
    <div class="campaign-card">
      <h3>${c.title}</h3>
      <p>${c.description}</p>
      <p><strong>Goal:</strong> $${c.goal}</p>
    </div>
  `).join("");
}
loadUserCampaigns();

/*///////////////////////////////////////////////// Load User Pledges //////////////////////////////////////////////////////////////////*/
async function loadUserPledges() {
  const pledgesDiv = document.getElementById("userPledges");
  const res = await fetch(`${API}/pledges?userId=${user.id}`);
  const pledges = await res.json();

  if (!pledges.length) {
    pledgesDiv.innerHTML = "<p>No pledges yet.</p>";
    return;
  }

  pledgesDiv.innerHTML = pledges.map(p => `
    <div class="pledge-card">
      <p>Pledged $${p.amount} to campaign #${p.campaignId} via ${p.paymentMethod}</p>
    </div>
  `).join("");
}
loadUserPledges();

/*/////////////////////////////////////////////////// Create Campaign ////////////////////////////////////////////////////////////////////*/
document.getElementById("createForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = document.getElementById("image").files[0];
  let base64 = "";
  if (file) base64 = await toBase64(file);

  const campaign = {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    goal: parseInt(document.getElementById("goal").value),
    deadline: document.getElementById("deadline").value,
    category: document.getElementById("category").value,
    creatorId: user.id,
    image: base64,
    isApproved: false,
    pledges: []
  };

  const res = await fetch(`${API}/campaigns`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(campaign)
  });

  if (res.ok) {
    Swal.fire("Created!", "Campaign submitted for approval.", "success");
    loadUserCampaigns();
  } else {
    Swal.fire("Error", "Could not create campaign", "error");
  }
});

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = err => reject(err);
  });
}
