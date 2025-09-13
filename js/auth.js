document.addEventListener("DOMContentLoaded", () => {
  const API = "http://localhost:3000";

  /*///////////////////////////////////////////////////////////// Register ///////////////////////////////////////////////////*/
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("registerEmail").value.trim();
      const password = document.getElementById("registerPassword").value.trim();

      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "user", isActive: true })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.accessToken);

        const userRes = await fetch(`${API}/600/users/${data.user.id}`, {
          headers: { Authorization: `Bearer ${data.accessToken}` }
        });
        const freshUser = await userRes.json();
        localStorage.setItem("user", JSON.stringify(freshUser));

        Swal.fire({
          icon: "success",
          title: "Welcome to Fundy 🎉",
          text: "Your account has been created!"
        }).then(() => {
          window.location.href = freshUser.role === "admin" ? "admin.html" : "profile.html"; 
        });
      } else if (data === "Email already exists") {
        Swal.fire({
          icon: "warning",
          title: "Email already registered",
          text: "Please login instead."
        }).then(() => {
          window.location.href = "login.html";
        });
      } else {
        Swal.fire("Error", data.message || "Something went wrong", "error");
      }
    });
  }

  /*///////////////////////////////////////////////////////  Login //////////////////////////////////////////////////////////*/
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();

      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.accessToken);

        const userRes = await fetch(`${API}/600/users/${data.user.id}`, {
          headers: { Authorization: `Bearer ${data.accessToken}` }
        });
        const freshUser = await userRes.json();
        localStorage.setItem("user", JSON.stringify(freshUser));

        Swal.fire({
          icon: "success",
          title: "Login Successful ✅",
          text: "Welcome back!"
        }).then(() => {
          window.location.href = freshUser.role === "admin" ? "admin.html" : "profile.html";
        });
      } else {
        Swal.fire("Error", "Invalid login credentials", "error");
      }
    });
  }
});
