// Sticky Navigation functionality
document.addEventListener("DOMContentLoaded", function () {
  const stickyNav = document.querySelector(".sticky-nav");
  const header = document.querySelector("header");

  // Check if we're on a mobile device (screen width <= 768px)
  function isMobile() {
    return window.innerWidth <= 768;
  }

  // Function to check scroll position and toggle sticky nav
  function checkScroll() {
    // Only apply sticky navigation on mobile
    if (!isMobile()) return;

    const headerHeight = header.offsetHeight;
    const scrollPosition = window.scrollY || window.pageYOffset;

    if (scrollPosition > headerHeight) {
      stickyNav.classList.add("visible");
    } else {
      stickyNav.classList.remove("visible");
    }
  }

  // Add scroll event listener
  window.addEventListener("scroll", checkScroll);

  // Add resize event listener to handle window resizing
  window.addEventListener("resize", function () {
    // If not mobile, ensure sticky nav is hidden
    if (!isMobile()) {
      stickyNav.classList.remove("visible");
    } else {
      // Recheck scroll position when switching to mobile
      checkScroll();
    }
  });

  // Initial check in case page is loaded scrolled down
  checkScroll();

  // Handle mobile login button
  const mobileLoginBtn = document.getElementById("mobileLoginBtn");
  if (mobileLoginBtn) {
    mobileLoginBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const loginPopup = document.getElementById("loginPopup");
      if (loginPopup) {
        loginPopup.classList.add("visible");
      }
    });
  }
});
