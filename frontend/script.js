function autoExpandTextarea(element) {
  element.style.height = "auto";
  element.style.height = element.scrollHeight + "px";
}

document.addEventListener("DOMContentLoaded", function () {
  const jobTitleSelect = document.getElementById("jobTitle");
  const customTitleInput = document.getElementById("customTitle");
  const generateCustomBtn = document.getElementById("generateCustom");
  const generateFinalBtn = document.getElementById("generateFinalButton");
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

  const generatedText = document.getElementById("generatedText");
  const copyButton = document.getElementById("copyButton");

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
    loadingIndicator.style.display = "none";
  }

  function clearError() {
    errorMessage.style.display = "none";
  }

  async function generateInitialData(jobTitle) {
    clearError();
    loadingIndicator.style.display = "block";
    generatedText.value = "";

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/generate-initial-data",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobTitle }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Server error: ${errorData.error || response.statusText}`
        );
      }

      const data = await response.json();

      // Update containers with initial data
      Object.entries(data).forEach(([key, items]) => {
        if (containers[key] && checkboxSections.includes(key)) {
          if (items && items.length > 0) {
            containers[key].innerHTML = items
              .map(
                (item) =>
                  `<label><input type="checkbox" checked> ${item}</label>`
              )
              .join("");
            containers[key].style.display = "block"; // Show container when it has content
          } else {
            containers[key].style.display = "none"; // Hide if empty
          }
        }
      });

      loadingIndicator.style.display = "none";
    } catch (error) {
      console.error("Error details:", error);
      showError(`Ett fel uppstod: ${error.message}`);
    }
  }

  async function generateFinalListing() {
    clearError();
    // Show loading animation on the button
    generateFinalBtn.textContent = "Genererar...";
    generateFinalBtn.style.animation =
      "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite";
    generateFinalBtn.disabled = true;

    try {
      // Collect all data including user inputs
      const data = {
        tasks: Array.from(
          containers.tasks.querySelectorAll("input:checked")
        ).map((checkbox) => checkbox.parentElement.textContent.trim()),
        requirements: Array.from(
          containers.requirements.querySelectorAll("input:checked")
        ).map((checkbox) => checkbox.parentElement.textContent.trim()),
        preferredSkills: Array.from(
          containers.preferredSkills.querySelectorAll("input:checked")
        ).map((checkbox) => checkbox.parentElement.textContent.trim()),
        about: [document.getElementById("aboutInput").value],
        location: [document.getElementById("locationInput").value],
        employmentType: [document.getElementById("employmentTypeInput").value],
        applyDay: [document.getElementById("applyDayInput").value],
        contact: [document.getElementById("contactInput").value],
      };

      const response = await fetch(
        "http://127.0.0.1:5000/generate-final-listing",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Server error: ${errorData.error || response.statusText}`
        );
      }

      const result = await response.json();
      generatedText.value = result.listing;

      // Auto-adjust height of generated text area
      generatedText.style.height = "auto";
      generatedText.style.height = generatedText.scrollHeight + 5 + "px";
    } catch (error) {
      console.error("Error details:", error);
      showError(`Ett fel uppstod: ${error.message}`);
    } finally {
      // Reset button state
      generateFinalBtn.textContent = "Generera Annons";
      generateFinalBtn.style.animation = "";
      generateFinalBtn.disabled = false;
    }
  }

  jobTitleSelect.addEventListener("change", function () {
    const jobTitle = this.value;
    const showCustom = jobTitle === "Eget";
    const customTitleContainer = document.querySelector(
      ".custom-title-container"
    );

    customTitleContainer.classList.toggle("visible", showCustom);
    customTitleInput.style.display = showCustom ? "block" : "none";
    generateCustomBtn.style.display = showCustom ? "block" : "none";

    if (!showCustom) {
      generateInitialData(jobTitle);
    }
  });

  generateCustomBtn.addEventListener("click", function () {
    const customTitle = customTitleInput.value.trim();
    if (customTitle) {
      generateInitialData(customTitle);
    } else {
      showError("Vänligen ange en egen titel");
    }
  });

  generateFinalBtn.addEventListener("click", generateFinalListing);

  copyButton.addEventListener("click", async function () {
    try {
      await navigator.clipboard.writeText(generatedText.value);
      const originalText = this.textContent;
      this.textContent = "Kopierat!";
      setTimeout(() => {
        this.textContent = originalText;
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  });

  // Add auto-expand to all textareas
  document.querySelectorAll("textarea").forEach((textarea) => {
    textarea.addEventListener("input", function () {
      autoExpandTextarea(this);
    });

    // Initial call to set correct height
    autoExpandTextarea(textarea);
  });
});
