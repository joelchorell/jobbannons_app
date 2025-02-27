function autoExpandTextarea(element) {
  element.style.height = "auto";
  element.style.height = element.scrollHeight + "px";
}

// Fix the validation popup issue - move this outside the DOMContentLoaded event
let generateFinalBtn; // Declare this at the top level

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

  // Add click event listeners to sidebar items
  sidebarItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Get the section to show
      const sectionToShow = this.getAttribute("data-section");

      console.log("Clicked sidebar item:", sectionToShow); // Debug log

      // Remove active class from all sidebar items
      sidebarItems.forEach((i) => i.classList.remove("active"));

      // Add active class to clicked item
      this.classList.add("active");

      // Hide all content sections
      contentSections.forEach((section) => {
        section.classList.remove("active");
      });

      // Show the selected section
      const targetSection = document.getElementById(`${sectionToShow}-section`);
      if (targetSection) {
        targetSection.classList.add("active");
      }
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
                  `<label><input type="checkbox" checked><span>${item}</span></label>`
              )
              .join("");

            // Add has-content class to show the container
            containers[key].classList.add("has-content");
          } else {
            containers[key].innerHTML = "";
            containers[key].classList.remove("has-content");
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

      // Update loading message
      const loadingText = loadingOverlay.querySelector(".loading-text");
      if (loadingText) {
        loadingText.textContent = "Genererar jobbannons...";
      }
    }

    // Collect all the data
    const jobTitle = document.getElementById("jobTitle").value;
    const customTitle = document.getElementById("customTitle").value;
    const title = jobTitle === "Eget" ? customTitle : jobTitle;

    const data = {
      title: title,
      about: [document.getElementById("aboutInput").value.trim()],
      location: [document.getElementById("locationInput").value.trim()],
      tasks: getCheckedItems("tasks"),
      requirements: getCheckedItems("requirements"),
      preferredSkills: getCheckedItems("preferredSkills"),
      employmentType: [
        document.getElementById("employmentTypeInput").value.trim(),
      ],
      applyDay: [document.getElementById("applyDayInput").value.trim()],
      contact: [document.getElementById("contactInput").value.trim()],
      extraInfo: [document.getElementById("extraInfoInput").value.trim()],
    };

    // Make API call to generate listing
    fetch("http://127.0.0.1:5000/generate-final-listing", {
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

        // Store the raw markdown in the hidden textarea
        const generatedText = document.getElementById("generatedText");
        if (generatedText) {
          generatedText.value =
            data.listing || "Kunde inte generera jobbannons.";
        }

        // Display the formatted HTML in the rich text editor
        const richTextEditor = document.getElementById("richTextEditor");
        if (richTextEditor) {
          richTextEditor.innerHTML = markdownToHtml(
            data.listing || "Kunde inte generera jobbannons."
          );
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
      // Get the text from the rich text editor
      const richTextEditor = document.getElementById("richTextEditor");
      await navigator.clipboard.writeText(richTextEditor.innerText);

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

  // Add special handling for single-line textareas
  document.querySelectorAll("textarea.single-line").forEach((textarea) => {
    textarea.addEventListener("input", function () {
      // Limit expansion for single-line textareas
      this.style.height = "42px";

      // Only allow it to grow to a maximum of 2 lines
      const maxHeight = 42 * 2; // 2 lines
      if (this.scrollHeight > maxHeight) {
        this.style.height = maxHeight + "px";
        this.style.overflowY = "auto";
      } else {
        this.style.height = this.scrollHeight + "px";
        this.style.overflowY = "hidden";
      }
    });

    // Initial call to set correct height
    textarea.style.height = "42px";
  });

  // Add event listeners for textareas only if they exist
  // Remove these declarations since they're redeclared later
  // const tasksInput = document.querySelector("#jobDetails-section textarea");
  // const requirementsInput = document.querySelector("#requirements-section textarea");
  // const preferredSkillsInput = document.querySelector("#preferredSkills-section textarea");

  // Function to add item to a container
  function addItemToContainer(inputElement, containerId) {
    const value = inputElement.value.trim();
    if (value) {
      const container = document.getElementById(containerId);

      // Create the label element
      const label = document.createElement("label");

      // Create the checkbox
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = true;

      // Create the span for the text
      const span = document.createElement("span");
      span.textContent = value;

      // Add the elements to the label
      label.appendChild(checkbox);
      label.appendChild(span);

      // Add the label to the container
      container.appendChild(label);

      // Add has-content class to show the container
      container.classList.add("has-content");

      // Clear the input
      inputElement.value = "";

      // Reset the height of the textarea
      autoExpandTextarea(inputElement);
    }
  }

  // Add Task Button
  const addTaskButton = document.getElementById("addTaskButton");
  const tasksInput = document.getElementById("tasksInput");
  if (addTaskButton && tasksInput) {
    addTaskButton.addEventListener("click", function () {
      addItemToContainer(tasksInput, "tasks");
    });

    // Keep the Enter key functionality
    tasksInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        addItemToContainer(this, "tasks");
      }
    });
  }

  // Add Requirement Button
  const addRequirementButton = document.getElementById("addRequirementButton");
  const requirementsInput = document.getElementById("requirementsInput");
  if (addRequirementButton && requirementsInput) {
    addRequirementButton.addEventListener("click", function () {
      addItemToContainer(requirementsInput, "requirements");
    });

    // Keep the Enter key functionality
    requirementsInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        addItemToContainer(this, "requirements");
      }
    });
  }

  // Add Preferred Skill Button
  const addPreferredSkillButton = document.getElementById(
    "addPreferredSkillButton"
  );
  const preferredSkillsInput = document.getElementById("preferredSkillsInput");
  if (addPreferredSkillButton && preferredSkillsInput) {
    addPreferredSkillButton.addEventListener("click", function () {
      addItemToContainer(preferredSkillsInput, "preferredSkills");
    });

    // Keep the Enter key functionality
    preferredSkillsInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        addItemToContainer(this, "preferredSkills");
      }
    });
  }

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

  // Move the event listener here
  if (generateFinalBtn) {
    console.log("Adding click event to generate button");
    generateFinalBtn.addEventListener("click", function (e) {
      console.log("Generate button clicked");
      // Check for missing fields
      const missingFields = validateForm();
      console.log("Missing fields:", missingFields);

      if (missingFields.length > 0) {
        // Show popup with missing fields
        console.log("Showing validation popup");
        showValidationPopup(missingFields);
        e.preventDefault();
      } else {
        // All fields are filled, proceed with generation
        console.log("Proceeding with generation");
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

  // Get the popup elements
  const validationPopup = document.getElementById("validationPopup");
  const closePopup = document.querySelector(".close-popup");
  const continueAnyway = document.getElementById("continueAnyway");
  const fillMissingInfo = document.getElementById("fillMissingInfo");
  const missingFieldsList = document.getElementById("missingFieldsList");

  // Handle "Continue Anyway" button
  if (continueAnyway) {
    continueAnyway.addEventListener("click", function () {
      console.log("Continue anyway clicked");
      validationPopup.style.display = "none";
      // Trigger the generation process
      generateFinalListing();
    });
  }

  // Handle "Fill Missing Info" button
  if (fillMissingInfo) {
    fillMissingInfo.addEventListener("click", function () {
      console.log("Fill missing info clicked");
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

  // Add functionality to style buttons
  document.addEventListener("DOMContentLoaded", function () {
    // Get the style buttons
    const professionalBtn = document.getElementById("professionalBtn");
    const joyfulBtn = document.getElementById("joyfulBtn");
    const conciseBtn = document.getElementById("conciseBtn");

    // Get the generated text elements
    const generatedText = document.getElementById("generatedText");
    const formattedText = document.getElementById("formattedText");

    // Function to update the text style
    async function updateTextStyle(style) {
      // Show loading overlay
      const loadingOverlay = document.getElementById("loadingOverlay");
      if (loadingOverlay) {
        loadingOverlay.classList.add("visible");

        // Update loading message
        const loadingText = loadingOverlay.querySelector(".loading-text");
        if (loadingText) {
          loadingText.textContent = `Gör texten mer ${style.toLowerCase()}...`;
        }
      }

      try {
        // Get the current text from the rich text editor
        const richTextEditor = document.getElementById("richTextEditor");
        const currentText = richTextEditor.innerText;

        // Create the request data
        const requestData = {
          text: currentText,
          style: style,
        };

        // Send the request to the API
        const response = await fetch("http://127.0.0.1:5000/update-style", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        // Parse the response
        const data = await response.json();

        // Update the text
        if (data.updated_text) {
          // Store the raw markdown in the hidden textarea
          document.getElementById("generatedText").value = data.updated_text;

          // Update the rich text editor with formatted HTML
          richTextEditor.innerHTML = markdownToHtml(data.updated_text);
        }
      } catch (error) {
        console.error("Error updating text style:", error);
        alert(
          "Ett fel uppstod när texten skulle uppdateras. Försök igen senare."
        );
      } finally {
        // Hide loading overlay
        if (loadingOverlay) {
          loadingOverlay.classList.remove("visible");
        }
      }
    }

    // Add click event listeners to the style buttons
    if (professionalBtn) {
      professionalBtn.addEventListener("click", function () {
        updateTextStyle("professionell");
      });
    }

    if (joyfulBtn) {
      joyfulBtn.addEventListener("click", function () {
        updateTextStyle("lättsam");
      });
    }

    if (conciseBtn) {
      conciseBtn.addEventListener("click", function () {
        updateTextStyle("koncis");
      });
    }
  });
});

// Improve the markdown to HTML conversion
function markdownToHtml(text) {
  if (!text) return "";

  // Handle headers
  text = text.replace(/^# (.*?)$/gm, "<h1>$1</h1>");
  text = text.replace(/^## (.*?)$/gm, "<h2>$1</h2>");
  text = text.replace(/^### (.*?)$/gm, "<h3>$1</h3>");

  // Handle bold text
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Handle italic text
  text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Handle line breaks
  text = text.replace(/\n/g, "<br>");

  // Handle lists
  text = text.replace(/^\- (.*?)$/gm, "<li>$1</li>");
  text = text.replace(/(<li>.*?<\/li>)+/g, "<ul>$&</ul>");

  return text;
}

// Update the getCheckedItems function to get text from the span element
function getCheckedItems(containerId) {
  const container = document.getElementById(containerId);
  const checkedItems = [];

  if (container) {
    const checkboxes = container.querySelectorAll(
      "input[type='checkbox']:checked"
    );
    checkboxes.forEach((checkbox) => {
      // Get the text from the span element that follows the checkbox
      const span = checkbox.nextElementSibling;
      if (span && span.tagName === "SPAN") {
        checkedItems.push(span.textContent.trim());
      }
    });
  }

  return checkedItems;
}
