document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const loginLink = document.getElementById("loginLink");
  const registerLink = document.getElementById("registerLink");
  const logoutBtn = document.getElementById("logoutBtn");
  const profileLink = document.getElementById("profileLink");
  const dashboardLink = document.getElementById("dashboardLink");
  const homeLink = document.getElementById("homeLink");

  const currentPage = window.location.pathname.split("/").pop();

  if (token && user) {
    if (loginLink) loginLink.style.display = "none";
    if (registerLink) registerLink.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";

    if (user.role === "admin") {
      if (dashboardLink) dashboardLink.style.display = "inline-block";
      if (profileLink) profileLink.style.display = "none";
    } else {
      if (profileLink) profileLink.style.display = "inline-block";
      if (dashboardLink) dashboardLink.style.display = "none";
    }
  } else {
    if (logoutBtn) logoutBtn.style.display = "none";
    if (profileLink) profileLink.style.display = "none";
    if (dashboardLink) dashboardLink.style.display = "none";

    if (currentPage === "index.html") {
      if (loginLink) loginLink.style.display = "inline-block";
      if (registerLink) registerLink.style.display = "inline-block";
    } else {
      if (loginLink) loginLink.style.display = "none";
      if (registerLink) registerLink.style.display = "none";
    }
  }

  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });

  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");
  hamburger?.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });
});
