const API = "http://localhost:3000";
const urlParams = new URLSearchParams(window.location.search);
const campaignId = urlParams.get("id");

const paymentForm = document.getElementById("paymentForm");
const campaignDetailsDiv = document.getElementById("campaignDetails");

let campaign = null;

/*///////////////////////////////////////////////////////// Load campaign info /////////////////////////////////////////////////////////*/
async function loadCampaign() {
  const res = await fetch(`${API}/campaigns/${campaignId}`);
  if (!res.ok) {
    Swal.fire("Error", "Campaign not found", "error").then(() => {
      window.location.href = "index.html";
    });
    return;
  }

  campaign = await res.json();

  const raised = campaign.pledges
    ? campaign.pledges.reduce((sum, p) => sum + p.amount, 0)
    : 0;
  const progress = Math.min((raised / campaign.goal) * 100, 100);

  campaignDetailsDiv.innerHTML = `
    <h3>${campaign.title}</h3>
    <p>${campaign.description}</p>
    <p><strong>Category:</strong> ${campaign.category || "Uncategorized"}</p>
    <div class="progress-bar">
      <div class="progress" style="width:${progress}%;"></div>
    </div>
    <p><strong>Goal:</strong> $${campaign.goal} | <strong>Raised:</strong> $${raised}</p>
  `;
}

/*//////////////////////////////////////////////////// Handle Payment ////////////////////////////////////////////////////////*/
paymentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) {
    Swal.fire("Unauthorized", "You must log in to pledge.", "error").then(() => {
      window.location.href = "login.html";
    });
    return;
  }

  const amount = parseFloat(document.getElementById("amount").value);
  const method = document.getElementById("method").value;

  if (!amount || amount <= 0) {
    Swal.fire("Invalid", "Please enter a valid amount.", "warning");
    return;
  }

  const newPledge = {
    userId: user.id,
    amount,
    paymentMethod: method,
    date: new Date().toISOString().split("T")[0]
  };

  const updatedPledges = campaign.pledges ? [...campaign.pledges, newPledge] : [newPledge];

  await fetch(`${API}/campaigns/${campaignId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ pledges: updatedPledges })
  });

  Swal.fire("Thank you!", `🎉 You pledged $${amount} via ${method}.`, "success").then(() => {
    localStorage.setItem("pledgeUpdate", Date.now());
    window.location.href = "index.html";
  });
});


loadCampaign();
