document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const loginLink = document.getElementById("loginLink");
  const registerLink = document.getElementById("registerLink");
  const logoutBtn = document.getElementById("logoutBtn");
  const homeLink = document.getElementById("homeLink");
  const profileLink = document.getElementById("profileLink");

  if (token && user) {
    if (loginLink) loginLink.style.display = "none";
    if (registerLink) registerLink.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";

    if (profileLink) profileLink.style.display = "inline-block";

    if (homeLink) {
      if (user.role === "admin") {
        homeLink.setAttribute("href", "admin.html");
      } else {
        homeLink.setAttribute("href", "index.html");
      }
    }
  } else {
    if (logoutBtn) logoutBtn.style.display = "none";
    if (profileLink) profileLink.style.display = "none";
    if (homeLink) homeLink.setAttribute("href", "index.html");
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