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
    extraInfo: document.getElementById("extraInfo"),
  };

  const checkboxSections = ["tasks", "requirements", "preferredSkills"];
  const textSections = [
    "about",
    "location",
    "employmentType",
    "applyDay",
    "contact",
    "extraInfo",
  ];

  const generatedText = document.getElementById("generatedText");
  const copyButton = document.getElementById("copyButton");

  const professionalBtn = document.getElementById("professionalBtn");
  const joyfulBtn = document.getElementById("joyfulBtn");
  const conciseBtn = document.getElementById("conciseBtn");

  // Sidebar navigation functionality
  const sidebarItems = document.querySelectorAll(".sidebar-item");
  const contentSections = document.querySelectorAll(".content-section");

  sidebarItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Remove active class from all sidebar items
      sidebarItems.forEach((i) => i.classList.remove("active"));

      // Add active class to clicked item
      this.classList.add("active");

      // Hide all content sections
      contentSections.forEach((section) => section.classList.remove("active"));

      // Show the corresponding content section
      const sectionId = this.getAttribute("data-section") + "-section";
      document.getElementById(sectionId).classList.add("active");
    });
  });

  function updateProgressIndicator(sectionId) {
    const progressSteps = document.querySelectorAll(".progress-step");

    // Define which sections belong to which progress step
    const stepMapping = {
      jobTitle: 0,
      about: 0,
      location: 0,
      tasks: 1,
      requirements: 1,
      preferredSkills: 1,
      employmentType: 2,
      applyDay: 2,
      contact: 2,
      extraInfo: 2,
    };

    const currentStep = stepMapping[sectionId];

    progressSteps.forEach((step, index) => {
      if (index < currentStep) {
        step.classList.remove("active");
        step.classList.add("completed");
      } else if (index === currentStep) {
        step.classList.add("active");
        step.classList.remove("completed");
      } else {
        step.classList.remove("active", "completed");
      }
    });
  }

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
    loadingIndicator.style.display = "none";
  }

  function clearError() {
    errorMessage.style.display = "none";
  }

  function showLoadingOverlay() {
    document.getElementById("loadingOverlay").classList.add("visible");
  }

  function hideLoadingOverlay() {
    document.getElementById("loadingOverlay").classList.remove("visible");
  }

  async function generateInitialData(jobTitle) {
    clearError();
    showLoadingOverlay();
    generatedText.value = "";

    try {
      // Hide any previous success message
      const successMessage = document.getElementById("suggestionsGenerated");
      successMessage.style.display = "none";

      // Create job title success message if it doesn't exist
      let jobTitleSuccess = document.getElementById("jobTitleSuccess");
      if (!jobTitleSuccess) {
        jobTitleSuccess = document.createElement("div");
        jobTitleSuccess.id = "jobTitleSuccess";
        jobTitleSuccess.className = "jobTitle-success";
        jobTitleSuccess.innerHTML = `
          <div class="success-icon">✓</div>
          <div class="success-text">
            <p>Du har valt:</p>
            <p class="title-display"></p>
            <a class="reset-link">Börja om</a>
          </div>
        `;

        // Add reset functionality
        const resetLink = jobTitleSuccess.querySelector(".reset-link");
        resetLink.addEventListener("click", function () {
          resetJobTitleSelection();
        });

        // Insert after the first section description
        const firstSectionDesc = document.querySelector(
          "#jobTitle-section .section-description"
        );
        firstSectionDesc.parentNode.insertBefore(
          jobTitleSuccess,
          firstSectionDesc.nextSibling
        );
      }

      // Update the selected title display
      const titleDisplay = jobTitleSuccess.querySelector(".title-display");
      titleDisplay.textContent = jobTitle;

      // Show the success message
      jobTitleSuccess.style.display = "block";

      // Add class to hide input elements
      const jobTitleSection = document.getElementById("jobTitle-section");
      jobTitleSection.classList.add("jobTitle-selected");

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

      // Show success message
      successMessage.style.display = "block";

      // Add click handler to "next step" text
      const nextStep = successMessage.querySelector(".next-step");
      nextStep.addEventListener("click", function () {
        // Find the company section in sidebar and click it
        document.querySelector('[data-section="company"]').click();
      });
    } catch (error) {
      console.error("Error details:", error);
      showError(`Ett fel uppstod: ${error.message}`);
    } finally {
      hideLoadingOverlay();
      loadingIndicator.style.display = "none";
    }
  }

  async function generateFinalListing() {
    // Show loading overlay
    const loadingOverlay = document.getElementById("loadingOverlay");
    if (loadingOverlay) {
      loadingOverlay.classList.add("visible");
    }

    // Collect all the data
    const jobTitle = document.getElementById("jobTitle").value;
    const customTitle = document.getElementById("customTitle").value;
    const title = jobTitle === "Eget" ? customTitle : jobTitle;

    const data = {
      title: title,
      about: document.getElementById("aboutInput").value.trim(),
      location: document.getElementById("locationInput").value.trim(),
      tasks: getCheckedItems("tasks"),
      requirements: getCheckedItems("requirements"),
      preferredSkills: getCheckedItems("preferredSkills"),
      employmentType: document
        .getElementById("employmentTypeInput")
        .value.trim(),
      applyDay: document.getElementById("applyDayInput").value.trim(),
      contact: document.getElementById("contactInput").value.trim(),
      extraInfo: document.getElementById("extraInfoInput").value.trim(),
    };

    // Make API call to generate listing
    fetch("/generate-listing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        // Hide loading overlay
        if (loadingOverlay) {
          loadingOverlay.classList.remove("visible");
        }

        // Display the generated content
        const generatedText = document.getElementById("generatedText");
        const formattedText = document.getElementById("formattedText");

        if (generatedText && formattedText) {
          generatedText.value =
            data.listing || "Kunde inte generera jobbannons.";
          formattedText.innerHTML = markdownToHtml(generatedText.value);
        }

        // Show the generated content section
        const generatedContent = document.querySelector(".generated-content");
        if (generatedContent) {
          generatedContent.style.display = "block";

          // Scroll to the generated content
          generatedContent.scrollIntoView({ behavior: "smooth" });
        }
      })
      .catch((error) => {
        console.error("Error:", error);

        // Hide loading overlay
        if (loadingOverlay) {
          loadingOverlay.classList.remove("visible");
        }

        // Show error message
        alert(
          "Ett fel uppstod vid generering av jobbannons. Försök igen senare."
        );
      });
  }

  async function regenerateWithStyle(style) {
    try {
      const currentText = generatedText.value;

      const response = await fetch("http://127.0.0.1:5000/regenerate-style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentText,
          style,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Server error: ${errorData.error || response.statusText}`
        );
      }

      const result = await response.json();
      if (result.listing) {
        generatedText.value = result.listing;
        const formattedText = document.getElementById("formattedText");
        formattedText.innerHTML = markdownToHtml(result.listing);
      }
    } catch (error) {
      console.error("Error details:", error);
      showError(`Ett fel uppstod: ${error.message}`);
    }
  }

  jobTitleSelect.addEventListener("change", function () {
    const jobTitle = this.value;
    if (jobTitle && jobTitle !== "Eget") {
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

  professionalBtn.addEventListener("click", () =>
    regenerateWithStyle("professional")
  );
  joyfulBtn.addEventListener("click", () => regenerateWithStyle("joyful"));
  conciseBtn.addEventListener("click", () => regenerateWithStyle("concise"));

  // Add auto-expand to all textareas
  document.querySelectorAll("textarea").forEach((textarea) => {
    textarea.addEventListener("input", function () {
      autoExpandTextarea(this);
    });

    // Initial call to set correct height
    autoExpandTextarea(textarea);
  });

  // Add functionality to add custom items from textareas
  document
    .getElementById("tasksInput")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        const value = this.value.trim();
        if (value) {
          const newItem = document.createElement("label");
          newItem.innerHTML = `<input type="checkbox" checked> ${value}`;
          containers.tasks.appendChild(newItem);
          this.value = "";
        }
      }
    });

  document
    .getElementById("requirementsInput")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        const value = this.value.trim();
        if (value) {
          const newItem = document.createElement("label");
          newItem.innerHTML = `<input type="checkbox" checked> ${value}`;
          containers.requirements.appendChild(newItem);
          this.value = "";
        }
      }
    });

  document
    .getElementById("preferredSkillsInput")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        const value = this.value.trim();
        if (value) {
          const newItem = document.createElement("label");
          newItem.innerHTML = `<input type="checkbox" checked> ${value}`;
          containers.preferredSkills.appendChild(newItem);
          this.value = "";
        }
      }
    });

  const resetButton = document.getElementById("resetButton");
  const jobTitleSection = document.getElementById("jobTitle-section");

  // Reset button functionality
  resetButton.addEventListener("click", function () {
    // Reset form fields
    document.getElementById("jobForm").reset();

    // Clear all checkboxes
    document.querySelectorAll(".checkbox-container").forEach((container) => {
      container.innerHTML = "";
    });

    // Hide success message
    const successMessage = document.getElementById("suggestionsGenerated");
    successMessage.classList.remove("visible");
    successMessage.style.display = "none"; // Explicitly hide it

    // Remove the suggestions-generated class to show input fields again
    jobTitleSection.classList.remove("suggestions-generated");

    // Go back to the job title section
    document.querySelector('[data-section="jobTitle"]').click();
  });

  // Modify the generateInitialData function to hide input fields
  const originalGenerateInitialData = window.generateInitialData;
  window.generateInitialData = async function (jobTitle) {
    await originalGenerateInitialData(jobTitle);

    // After successful generation, add class to hide input fields
    jobTitleSection.classList.add("suggestions-generated");
  };

  // Add validation for the generate button
  const validationPopup = document.getElementById("validationPopup");
  const closePopup = document.querySelector(".close-popup");
  const continueAnyway = document.getElementById("continueAnyway");
  const fillMissingInfo = document.getElementById("fillMissingInfo");
  const missingFieldsList = document.getElementById("missingFieldsList");

  if (generateFinalBtn) {
    generateFinalBtn.addEventListener("click", function (e) {
      // Check for missing fields
      const missingFields = validateForm();

      if (missingFields.length > 0) {
        // Show popup with missing fields
        showValidationPopup(missingFields);
        e.preventDefault();
      } else {
        // All fields are filled, proceed with generation
        generateFinalListing();
      }
    });
  }

  function validateForm() {
    const missingFields = [];

    // Check company info
    if (!document.getElementById("aboutInput").value.trim()) {
      missingFields.push("Information om företaget");
    }

    // Check location
    if (!document.getElementById("locationInput").value.trim()) {
      missingFields.push("Plats/Ort");
    }

    // Check tasks
    if (document.querySelectorAll("#tasks input:checked").length === 0) {
      missingFields.push("Arbetsuppgifter");
    }

    // Check requirements
    if (document.querySelectorAll("#requirements input:checked").length === 0) {
      missingFields.push("Kvalifikationer");
    }

    // Check employment type
    if (!document.getElementById("employmentTypeInput").value.trim()) {
      missingFields.push("Anställningsform");
    }

    // Check application deadline
    if (!document.getElementById("applyDayInput").value.trim()) {
      missingFields.push("Sista ansökningsdag");
    }

    // Check contact info
    if (!document.getElementById("contactInput").value.trim()) {
      missingFields.push("Kontaktinformation");
    }

    return missingFields;
  }

  function showValidationPopup(missingFields) {
    // Clear previous list
    missingFieldsList.innerHTML = "";

    // Add each missing field to the list
    missingFields.forEach((field) => {
      const li = document.createElement("li");
      li.textContent = field;
      missingFieldsList.appendChild(li);
    });

    // Show the popup
    validationPopup.style.display = "block";
  }

  // Close popup when clicking the X
  if (closePopup) {
    closePopup.addEventListener("click", function () {
      validationPopup.style.display = "none";
    });
  }

  // Close popup when clicking outside
  window.addEventListener("click", function (e) {
    if (e.target === validationPopup) {
      validationPopup.style.display = "none";
    }
  });

  // Handle "Continue Anyway" button
  if (continueAnyway) {
    continueAnyway.addEventListener("click", function () {
      validationPopup.style.display = "none";
      // Trigger the generation process
      generateFinalListing();
    });
  }

  // Handle "Fill Missing Info" button
  if (fillMissingInfo) {
    fillMissingInfo.addEventListener("click", function () {
      validationPopup.style.display = "none";
      // Navigate to the first section with missing info
      const missingFields = validateForm();
      if (missingFields.length > 0) {
        // Determine which section to navigate to
        let sectionToNavigate;

        if (
          missingFields.includes("Information om företaget") ||
          missingFields.includes("Plats/Ort")
        ) {
          sectionToNavigate = "company";
        } else if (missingFields.includes("Arbetsuppgifter")) {
          sectionToNavigate = "jobDetails";
        } else if (missingFields.includes("Kvalifikationer")) {
          sectionToNavigate = "requirements";
        } else if (
          missingFields.includes("Anställningsform") ||
          missingFields.includes("Sista ansökningsdag") ||
          missingFields.includes("Kontaktinformation")
        ) {
          sectionToNavigate = "details";
        }

        // Click on the appropriate sidebar item
        if (sectionToNavigate) {
          document
            .querySelector(`[data-section="${sectionToNavigate}"]`)
            .click();
        }
      }
    });
  }

  // Add this function to reset the job title selection
  function resetJobTitleSelection() {
    // Reset the job title select
    const jobTitleSelect = document.getElementById("jobTitle");
    jobTitleSelect.value = "";

    // Reset the custom title input
    const customTitleInput = document.getElementById("customTitle");
    customTitleInput.value = "";

    // Hide the job title success message
    const jobTitleSuccess = document.getElementById("jobTitleSuccess");
    if (jobTitleSuccess) {
      jobTitleSuccess.style.display = "none";
    }

    // Remove the class that hides input elements
    const jobTitleSection = document.getElementById("jobTitle-section");
    jobTitleSection.classList.remove("jobTitle-selected");

    // Clear the generated data
    const containers = ["tasks", "requirements", "preferredSkills"];
    containers.forEach((containerId) => {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = "";
      }
    });

    // Hide the success message
    const successMessage = document.getElementById("suggestionsGenerated");
    successMessage.style.display = "none";
  }
});

// Add this function to convert markdown to HTML
function markdownToHtml(text) {
  return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

// Helper function to get checked items
function getCheckedItems(containerId) {
  const container = document.getElementById(containerId);
  const checkedItems = [];

  if (container) {
    const checkboxes = container.querySelectorAll(
      "input[type='checkbox']:checked"
    );
    checkboxes.forEach((checkbox) => {
      checkedItems.push(checkbox.parentNode.textContent.trim());
    });
  }

  return checkedItems;
}
