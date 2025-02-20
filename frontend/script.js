document.addEventListener("DOMContentLoaded", function () {
  const jobTitleSelect = document.getElementById("jobTitle");
  const customTitleInput = document.getElementById("customTitle");
  const generateCustomBtn = document.getElementById("generateCustom");
  const loadingIndicator = document.querySelector(".loading");
  const errorMessage = document.getElementById("errorMessage");
  const containers = {
    tasks: document.getElementById("tasks"),
    requirements: document.getElementById("requirements"),
    preferredSkills: document.getElementById("preferredSkills"),
    about: document.getElementById("about"),
    location: document.getElementById("location"),
    employmentType: document.getElementById("employmentType"),
    applyDay: document.getElementById("applyDay"),
    contact: document.getElementById("contact"),
  };

  const checkboxSections = ["tasks", "requirements", "preferredSkills"];
  const textSections = [
    "about",
    "location",
    "employmentType",
    "applyDay",
    "contact",
  ];

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
    loadingIndicator.style.display = "none";
  }

  function clearError() {
    errorMessage.style.display = "none";
  }

  async function generateJobData(jobTitle) {
    clearError();
    loadingIndicator.style.display = "block";

    console.log("Sending request for job title:", jobTitle); // Debug log

    try {
      const response = await fetch("http://127.0.0.1:5000/generate-job-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle }),
      });

      console.log("Response status:", response.status); // Debug log

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Server error: ${errorData.error || response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Received data:", data); // Debug log

      loadingIndicator.style.display = "none";

      // Update containers with data
      Object.entries(data).forEach(([key, items]) => {
        if (containers[key]) {
          if (checkboxSections.includes(key)) {
            // Sections that should have checkboxes
            containers[key].innerHTML = items
              .map(
                (item) =>
                  `<label><input type="checkbox" checked> ${item}</label>`
              )
              .join("");
          } else if (textSections.includes(key)) {
            // Sections that should only show text
            containers[key].innerHTML = items
              .map((item) => `<p>${item}</p>`)
              .join("");
          }
        }
      });
    } catch (error) {
      console.error("Error details:", error); // Debug log
      showError(`Ett fel uppstod: ${error.message}`);
    }
  }

  jobTitleSelect.addEventListener("change", function () {
    const jobTitle = this.value;
    const showCustom = jobTitle === "Eget";
    const customTitleContainer = document.querySelector(
      ".custom-title-container"
    );

    // Show/hide the entire container
    customTitleContainer.classList.toggle("visible", showCustom);
    customTitleInput.style.display = showCustom ? "block" : "none";
    generateCustomBtn.style.display = showCustom ? "block" : "none";

    if (!showCustom) {
      generateJobData(jobTitle);
    }
  });

  generateCustomBtn.addEventListener("click", function () {
    const customTitle = customTitleInput.value.trim();
    if (customTitle) {
      generateJobData(customTitle);
    } else {
      showError("Vänligen ange en egen titel");
    }
  });
});
