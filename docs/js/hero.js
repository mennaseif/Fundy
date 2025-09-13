let currentSlide = 0;
const slides = document.querySelectorAll("#heroCarousel .carousel-item");
const indicators = document.querySelectorAll("#heroCarousel .carousel-indicators span");

function updateCarousel() {
  document.querySelector(".carousel-inner").style.transform =
    `translateX(-${currentSlide * 100}%)`;

  indicators.forEach((dot, i) => {
    dot.classList.toggle("active", i === currentSlide);
  });
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  updateCarousel();
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  updateCarousel();
}

function goToSlide(index) {
  currentSlide = index;
  updateCarousel();
}

setInterval(nextSlide, 5000);


document.addEventListener("DOMContentLoaded", () => {
  window.startCampaign = function () {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user) {
      localStorage.setItem("redirectAfterLogin", "create.html");

      Swal.fire({
        icon: "warning",
        title: "Login required ⚠️",
        text: "You must login first to start a campaign.",
        confirmButtonColor: "#10B981"
      }).then(() => {
        window.location.href = "login.html";
      });
    } else {
      window.location.href = "create.html";
    }
  };
});

