document.addEventListener("DOMContentLoaded", function () {
  // Handle CTA button clicks
  function handleCTAClick(e) {
    e.preventDefault();
    // Direct users straight to the app page
    window.location.href = "app.html";
  }

  // Add click handlers to all CTA buttons
  const ctaButtons = [
    document.getElementById("mainCTA"),
    document.getElementById("freeCTA"),
    document.getElementById("premiumCTA"),
    document.getElementById("bottomCTA"),
  ];

  ctaButtons.forEach((button) => {
    if (button) {
      button.addEventListener("click", handleCTAClick);
    }
  });

  // Handle login button click
  const loginBtn = document.getElementById("headerLoginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const loginPopup = document.getElementById("loginPopup");
      if (loginPopup) {
        loginPopup.classList.add("visible");
      }
    });
  }

  // Handle popup close
  const popupCloseButtons = document.querySelectorAll(".popup-close");
  popupCloseButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const popup = this.closest(".popup");
      popup.classList.remove("visible");
    });
  });

  // Handle auth tabs
  const authTabs = document.querySelectorAll(".auth-tab");
  authTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const tabId = this.getAttribute("data-tab");

      // Update active tab
      authTabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      // Show corresponding form
      const loginForm = document.getElementById("loginForm");
      const registerForm = document.getElementById("registerForm");

      if (tabId === "login") {
        loginForm.style.display = "block";
        registerForm.style.display = "none";
      } else {
        loginForm.style.display = "none";
        registerForm.style.display = "block";
      }
    });
  });
});
