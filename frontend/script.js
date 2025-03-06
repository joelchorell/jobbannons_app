// Configurable API base URL - replace with your Worker URL after wrangler deploy
const API_BASE_URL = "https://api.rescriber.com";

function autoExpandTextarea(element) {
  element.style.height = "auto";
  element.style.height = element.scrollHeight + "px";
}

// Encapsulate app logic in an IIFE to reduce globals
(function () {
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

    const sidebarItems = document.querySelectorAll(".sidebar-item");
    const contentSections = document.querySelectorAll(".content-section");

    // Sidebar navigation
    sidebarItems.forEach((item) => {
      item.addEventListener("click", function () {
        const sectionToShow = this.getAttribute("data-section");
        console.log("Clicked sidebar item:", sectionToShow);
        sidebarItems.forEach((i) => i.classList.remove("active"));
        this.classList.add("active");
        contentSections.forEach((section) =>
          section.classList.remove("active")
        );
        const targetSection = document.getElementById(
          `${sectionToShow}-section`
        );
        if (targetSection) targetSection.classList.add("active");
      });
    });

    function updateProgressIndicator(sectionId) {
      const progressSteps = document.querySelectorAll(".progress-step");
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
        const successMessage = document.getElementById("suggestionsGenerated");
        successMessage.style.display = "none";

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
          const resetLink = jobTitleSuccess.querySelector(".reset-link");
          resetLink.addEventListener("click", resetJobTitleSelection);
          const firstSectionDesc = document.querySelector(
            "#jobTitle-section .section-description"
          );
          firstSectionDesc.parentNode.insertBefore(
            jobTitleSuccess,
            firstSectionDesc.nextSibling
          );
        }

        const titleDisplay = jobTitleSuccess.querySelector(".title-display");
        titleDisplay.textContent = jobTitle;
        jobTitleSuccess.style.display = "block";

        const jobTitleSection = document.getElementById("jobTitle-section");
        jobTitleSection.classList.add("jobTitle-selected");

        const response = await fetch(`${API_BASE_URL}/generate-initial-data`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobTitle }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Server error: ${errorData.error || response.statusText}`
          );
        }

        const data = await response.json();

        Object.entries(data).forEach(([key, items]) => {
          if (containers[key] && checkboxSections.includes(key)) {
            if (items && items.length > 0) {
              containers[key].innerHTML = items
                .map(
                  (item) =>
                    `<label><input type="checkbox" checked><span>${item}</span></label>`
                )
                .join("");
              containers[key].classList.add("has-content");
            } else {
              containers[key].innerHTML = "";
              containers[key].classList.remove("has-content");
            }
          }
        });

        successMessage.style.display = "block";

        const nextStep = successMessage.querySelector(".next-step");
        nextStep.addEventListener("click", () =>
          document.querySelector('[data-section="company"]').click()
        );

        updateSidebarItems();
      } catch (error) {
        console.error("Error details:", error);
        showError(`Ett fel uppstod: ${error.message}`);
      } finally {
        hideLoadingOverlay();
        loadingIndicator.style.display = "none";
      }
    }

    function updateSidebarItems() {
      const sectionsToUpdate = [
        "jobDetails",
        "requirements",
        "preferredSkills",
      ];
      sectionsToUpdate.forEach((section) => {
        const sidebarItem = document.querySelector(
          `.sidebar-item[data-section="${section}"]`
        );
        if (sidebarItem) {
          sidebarItem.classList.add("pulse-animation");
          setTimeout(
            () => sidebarItem.classList.remove("pulse-animation"),
            1500
          );
        }
      });
    }

    async function generateFinalListing() {
      const loadingOverlay = document.getElementById("loadingOverlay");
      if (loadingOverlay) {
        loadingOverlay.classList.add("visible");
        const loadingText = loadingOverlay.querySelector(".loading-text");
        if (loadingText) loadingText.textContent = "Genererar jobbannons...";
      }

      const jobTitle = document.getElementById("jobTitle").value;
      const customTitle = document.getElementById("customTitle").value;
      const title = jobTitle === "Eget" ? customTitle : jobTitle;

      const data = {
        title,
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

      fetch(`${API_BASE_URL}/generate-final-listing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => {
          if (loadingOverlay) loadingOverlay.classList.remove("visible");

          const generatedText = document.getElementById("generatedText");
          if (generatedText) {
            generatedText.value =
              data.listing || "Kunde inte generera jobbannons.";
          }

          const richTextEditor = document.getElementById("richTextEditor");
          if (richTextEditor) {
            richTextEditor.innerHTML = markdownToHtml(
              data.listing || "Kunde inte generera jobbannons."
            );
          }

          const generatedContent = document.querySelector(".generated-content");
          if (generatedContent) {
            generatedContent.style.display = "block";
            generatedContent.scrollIntoView({ behavior: "smooth" });
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          if (loadingOverlay) loadingOverlay.classList.remove("visible");
          alert(
            "Ett fel uppstod vid generering av jobbannons. Försök igen senare."
          );
        });
    }

    async function regenerateWithStyle(style) {
      // Note: This still uses local Flask - add to Worker if needed
      try {
        const currentText = generatedText.value;

        const response = await fetch("http://127.0.0.1:5000/regenerate-style", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentText, style }),
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
          const richTextEditor = document.getElementById("richTextEditor");
          if (richTextEditor) {
            richTextEditor.innerHTML = markdownToHtml(result.listing);
          } else {
            console.error("Rich text editor element not found");
          }
        }
      } catch (error) {
        console.error("Error details:", error);
        showError(`Ett fel uppstod: ${error.message}`);
      }
    }

    jobTitleSelect.addEventListener("change", function () {
      const jobTitle = this.value;
      if (jobTitle && jobTitle !== "Eget") generateInitialData(jobTitle);
    });

    generateCustomBtn.addEventListener("click", function () {
      const customTitle = customTitleInput.value.trim();
      if (customTitle) generateInitialData(customTitle);
      else showError("Vänligen ange en egen titel");
    });

    copyButton.addEventListener("click", async function () {
      try {
        const richTextEditor = document.getElementById("richTextEditor");
        await navigator.clipboard.writeText(richTextEditor.innerText);
        const originalText = this.textContent;
        this.textContent = "Kopierat!";
        setTimeout(() => (this.textContent = originalText), 2000);
      } catch (err) {
        console.error("Failed to copy text:", err);
      }
    });

    document.querySelectorAll("textarea").forEach((textarea) => {
      textarea.addEventListener("input", () => autoExpandTextarea(textarea));
      autoExpandTextarea(textarea);
    });

    document.querySelectorAll("textarea.single-line").forEach((textarea) => {
      textarea.addEventListener("input", function () {
        this.style.height = "42px";
        const maxHeight = 42 * 2;
        if (this.scrollHeight > maxHeight) {
          this.style.height = maxHeight + "px";
          this.style.overflowY = "auto";
        } else {
          this.style.height = this.scrollHeight + "px";
          this.style.overflowY = "hidden";
        }
      });
      textarea.style.height = "42px";
    });

    // Refactored add item handlers
    function setupAddItemHandlers(section) {
      const button = document.getElementById(`add${section}Button`);
      const input = document.getElementById(`${section.toLowerCase()}Input`);
      if (button && input) {
        const addHandler = () =>
          addItemToContainer(input, section.toLowerCase());
        button.addEventListener("click", addHandler);
        input.addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addHandler();
          }
        });
      }
    }

    ["Tasks", "Requirement", "PreferredSkill"].forEach(setupAddItemHandlers);

    function addItemToContainer(inputElement, containerId) {
      const value = inputElement.value.trim();
      if (value) {
        const container = document.getElementById(containerId);
        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = true;
        const span = document.createElement("span");
        span.textContent = value;
        label.appendChild(checkbox);
        label.appendChild(span);
        container.appendChild(label);
        container.classList.add("has-content");
        inputElement.value = "";
        autoExpandTextarea(inputElement);
      }
    }

    const resetButton = document.getElementById("resetButton");
    const jobTitleSection = document.getElementById("jobTitle-section");

    resetButton.addEventListener("click", () => {
      document.getElementById("jobForm").reset();
      document.querySelectorAll(".checkbox-container").forEach((container) => {
        container.innerHTML = "";
      });
      const successMessage = document.getElementById("suggestionsGenerated");
      successMessage.classList.remove("visible");
      successMessage.style.display = "none";
      jobTitleSection.classList.remove("suggestions-generated");
      document.querySelector('[data-section="jobTitle"]').click();
    });

    const originalGenerateInitialData = generateInitialData;
    window.generateInitialData = async function (jobTitle) {
      await originalGenerateInitialData(jobTitle);
      jobTitleSection.classList.add("suggestions-generated");
    };

    if (generateFinalBtn) {
      generateFinalBtn.addEventListener("click", validateAndGenerate);
    }

    function validateAndGenerate() {
      console.log("Validating form before generation");
      const missingFields = validateForm();
      console.log("Missing fields:", missingFields);
      if (missingFields.length > 0) {
        console.log("Showing validation popup");
        showValidationPopup(missingFields);
      } else {
        console.log("Proceeding with generation");
        generateFinalListing();
      }
    }

    function validateForm() {
      const missingFields = [];
      if (!document.getElementById("aboutInput").value.trim())
        missingFields.push("Information om företaget");
      if (!document.getElementById("locationInput").value.trim())
        missingFields.push("Plats/Ort");
      if (document.querySelectorAll("#tasks input:checked").length === 0)
        missingFields.push("Arbetsuppgifter");
      if (document.querySelectorAll("#requirements input:checked").length === 0)
        missingFields.push("Kvalifikationer");
      if (!document.getElementById("employmentTypeInput").value.trim())
        missingFields.push("Anställningsform");
      if (!document.getElementById("applyDayInput").value.trim())
        missingFields.push("Sista ansökningsdag");
      if (!document.getElementById("contactInput").value.trim())
        missingFields.push("Kontaktinformation");
      return missingFields;
    }

    function showValidationPopup(missingFields) {
      const validationPopup = document.getElementById("validationPopup");
      const missingFieldsList = document.getElementById("missingFieldsList");
      missingFieldsList.innerHTML = "";
      missingFields.forEach((field) => {
        const li = document.createElement("li");
        li.textContent = field;
        missingFieldsList.appendChild(li);
      });
      validationPopup.style.display = "block";
    }

    const closePopup = document.querySelector(".close-popup");
    const continueAnyway = document.getElementById("continueAnyway");
    const fillMissingInfo = document.getElementById("fillMissingInfo");

    if (continueAnyway) {
      continueAnyway.addEventListener("click", () => {
        console.log("Continue anyway clicked");
        validationPopup.style.display = "none";
        generateFinalListing();
      });
    }

    if (fillMissingInfo) {
      fillMissingInfo.addEventListener("click", () => {
        console.log("Fill missing info clicked");
        validationPopup.style.display = "none";
        const missingFields = validateForm();
        if (missingFields.length > 0) {
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
          if (sectionToNavigate) {
            document
              .querySelector(`[data-section="${sectionToNavigate}"]`)
              .click();
          }
        }
      });
    }

    if (closePopup) {
      closePopup.addEventListener("click", () => {
        validationPopup.style.display = "none";
      });
    }

    window.addEventListener("click", (e) => {
      if (e.target === validationPopup) validationPopup.style.display = "none";
    });

    function resetJobTitleSelection() {
      const jobTitleSelect = document.getElementById("jobTitle");
      jobTitleSelect.value = "";
      const customTitleInput = document.getElementById("customTitle");
      customTitleInput.value = "";
      const jobTitleSuccess = document.getElementById("jobTitleSuccess");
      if (jobTitleSuccess) jobTitleSuccess.style.display = "none";
      const jobTitleSection = document.getElementById("jobTitle-section");
      jobTitleSection.classList.remove("jobTitle-selected");
      const containers = ["tasks", "requirements", "preferredSkills"];
      containers.forEach((containerId) => {
        const container = document.getElementById(containerId);
        if (container) container.innerHTML = "";
      });
      const successMessage = document.getElementById("suggestionsGenerated");
      successMessage.style.display = "none";
    }

    async function updateTextStyle(style) {
      console.log("updateTextStyle called with style:", style);
      const loadingOverlay = document.getElementById("loadingOverlay");
      if (loadingOverlay) {
        const loadingText = loadingOverlay.querySelector(".loading-text");
        if (loadingText)
          loadingText.textContent = `Jobbar med att ändra stilen till mer ${style.toLowerCase()}...`;
        loadingOverlay.classList.add("visible");
      }

      try {
        const richTextEditor = document.getElementById("richTextEditor");
        if (!richTextEditor) {
          console.error("Rich text editor element not found");
          return;
        }

        const currentText = richTextEditor.innerText;
        console.log("Text to style:", currentText.substring(0, 50) + "...");

        const requestData = { text: currentText, style };
        console.log("Sending request to API:", requestData);

        const response = await fetch(`${API_BASE_URL}/update-style`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        });

        console.log("Response status:", response.status);
        const data = await response.json();
        console.log("Response data:", data);

        if (data.updated_text) {
          const generatedText = document.getElementById("generatedText");
          if (generatedText) generatedText.value = data.updated_text;
          richTextEditor.innerHTML = markdownToHtml(data.updated_text);
          console.log("Text updated successfully");
        }
      } catch (error) {
        console.error("Error updating text style:", error);
        alert(
          "Ett fel uppstod när texten skulle uppdateras. Försök igen senare."
        );
      } finally {
        if (loadingOverlay) loadingOverlay.classList.remove("visible");
      }
    }

    if (professionalBtn) {
      professionalBtn.addEventListener("click", () =>
        updateTextStyle("professionell")
      );
    }

    if (joyfulBtn) {
      joyfulBtn.addEventListener("click", () => updateTextStyle("lättsam"));
    }

    if (conciseBtn) {
      conciseBtn.addEventListener("click", () => updateTextStyle("koncis"));
    }

    if (!document.getElementById("sidebarIndicatorStyles")) {
      const styleElement = document.createElement("style");
      styleElement.id = "sidebarIndicatorStyles";
      styleElement.textContent = `
        .sidebar-item.has-content { background-color: rgba(99, 102, 241, 0.1); position: relative; }
        .sidebar-item.has-content::after { content: '✓'; display: inline-block; margin-left: 8px; color: #10b981; font-weight: bold; }
      `;
      document.head.appendChild(styleElement);
    }

    if (!document.getElementById("sidebarAnimationStyles")) {
      const styleElement = document.createElement("style");
      styleElement.id = "sidebarAnimationStyles";
      styleElement.textContent = `
        @keyframes pulseHighlight { 0% { background-color: rgba(99, 102, 241, 0.1); } 50% { background-color: rgba(99, 102, 241, 0.3); } 100% { background-color: transparent; } }
        .sidebar-item.pulse-animation { animation: pulseHighlight 1.5s ease-in-out forwards; }
      `;
      document.head.appendChild(styleElement);
    }
  });

  function markdownToHtml(text) {
    if (!text) return "";
    text = text.replace(/^# (.*?)$/gm, "<h1>$1</h1>");
    text = text.replace(/^## (.*?)$/gm, "<h2>$1</h2>");
    text = text.replace(/^### (.*?)$/gm, "<h3>$1</h3>");
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");
    text = text.replace(/\n/g, "<br>");
    text = text.replace(/^\- (.*?)$/gm, "<li>$1</li>");
    text = text.replace(/(<li>.*?<\/li>)+/g, "<ul>$&</ul>");
    return text;
  }

  function getCheckedItems(containerId) {
    const container = document.getElementById(containerId);
    const checkedItems = [];
    if (container) {
      const checkboxes = container.querySelectorAll(
        "input[type='checkbox']:checked"
      );
      checkboxes.forEach((checkbox) => {
        const span = checkbox.nextElementSibling;
        if (span && span.tagName === "SPAN") {
          checkedItems.push(span.textContent.trim());
        }
      });
    }
    return checkedItems;
  }
})();
