// Configurable API base URL - replace with your Worker URL after wrangler deploy
const API_BASE_URL = "https://api.rescriber.com";

function autoExpandTextarea(element) {
  element.style.height = "auto";
  element.style.height = element.scrollHeight + "px";
}

// Encapsulate app logic in an IIFE to reduce globals
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    // Form elements
    const jobTitleSelect = document.getElementById("jobTitle");
    const customTitleInput = document.getElementById("customTitle");
    const generateCustomBtn = document.getElementById("generateCustom");
    const generateFinalBtn = document.getElementById("generateFinalButton");
    const mobileGenerateBtn = document.getElementById("mobileGenerateButton");
    const generateFromMoreMenuBtn = document.getElementById(
      "generateFromMoreMenu"
    );
    const loadingIndicator = document.querySelector(".loading-overlay");
    const errorMessage = document.getElementById("errorMessage");

    // Input containers - get all instances of these elements
    const containers = {
      tasks: document.getElementById("tasks"),
      requirements: document.getElementById("requirements"),
      preferredSkills: document.getElementById("preferredSkills"),
    };

    // Text inputs
    const textInputs = {
      about: document.getElementById("aboutInput"),
      location: document.getElementById("locationInput"),
      employmentType: document.getElementById("employmentTypeInput"),
      applyDay: document.getElementById("applyDayInput"),
      contact: document.getElementById("contactInput"),
      extraInfo: document.getElementById("extraInfoInput"),
    };

    // Generated content elements
    const generatedContent = document.getElementById("generatedContent");
    const generatedText = document.getElementById("generatedText");
    const richTextEditor = document.getElementById("richTextEditor");
    const copyButton = document.getElementById("copyButton");

    // Style buttons
    const professionalBtn = document.getElementById("professionalBtn");
    const joyfulBtn = document.getElementById("joyfulBtn");
    const conciseBtn = document.getElementById("conciseBtn");

    // Navigation elements
    const sidebarItems = document.querySelectorAll(".sidebar-item");
    const mobileNavItems = document.querySelectorAll(".mobile-nav-item");
    const sections = document.querySelectorAll(".section");
    const progressSteps = document.querySelectorAll(".progress-step");

    // Mobile tabs
    const mobileTabs = document.querySelectorAll(".mobile-tab");
    const mobileTabContents = document.querySelectorAll(".mobile-tab-content");

    // Step navigation
    const prevStepBtn = document.getElementById("prevStepBtn");
    const nextStepBtn = document.getElementById("nextStepBtn");

    // Popups
    const validationPopup = document.getElementById("validationPopup");
    const popupCloseButtons = document.querySelectorAll(".popup-close");

    // Current section tracking
    let currentSectionIndex = 0;
    const sectionIds = [
      "jobTitle-section",
      "company-section",
      "content-section",
      "details-section",
    ];

    // Initialize mobile navigation
    initMobileNavigation();

    // Initialize mobile tabs
    initMobileTabs();

    // Initialize step navigation
    initStepNavigation();

    // Initialize popups
    initPopups();

    // Initialize form elements
    initFormElements();

    // Initialize event listeners
    initEventListeners();

    // Setup add item handlers
    setupAddItemHandlers();

    // Functions

    function initMobileNavigation() {
      // Handle mobile navigation clicks
      mobileNavItems.forEach((item) => {
        item.addEventListener("click", function () {
          const sectionId = this.getAttribute("data-section");

          // Map section IDs to actual section IDs
          const sectionMapping = {
            jobTitle: "jobTitle",
            company: "company",
            content: "content",
            details: "details",
          };

          const mappedSectionId = sectionMapping[sectionId] || sectionId;

          // Update active states
          mobileNavItems.forEach((navItem) => {
            navItem
              .querySelector(".mobile-nav-link")
              .classList.remove("active");
          });
          this.querySelector(".mobile-nav-link").classList.add("active");

          // Show the corresponding section
          navigateToSection(mappedSectionId);
        });
      });
    }

    // Initialize empty state messages
    updateEmptySectionMessages();

    function updateEmptySectionMessages() {
      // Get the empty message elements
      const tasksEmptyMessage = document.getElementById("tasks-empty-message");
      const requirementsEmptyMessage = document.getElementById(
        "requirements-empty-message"
      );
      const preferredSkillsEmptyMessage = document.getElementById(
        "preferredSkills-empty-message"
      );

      // Check if containers have content
      if (tasksEmptyMessage && containers.tasks) {
        tasksEmptyMessage.style.display =
          containers.tasks.children.length > 0 ? "none" : "block";
      }

      if (requirementsEmptyMessage && containers.requirements) {
        requirementsEmptyMessage.style.display =
          containers.requirements.children.length > 0 ? "none" : "block";
      }

      if (preferredSkillsEmptyMessage && containers.preferredSkills) {
        preferredSkillsEmptyMessage.style.display =
          containers.preferredSkills.children.length > 0 ? "none" : "block";
      }
    }

    function initMobileTabs() {
      // Handle mobile tab clicks
      mobileTabs.forEach((tab) => {
        tab.addEventListener("click", function () {
          const tabId = this.getAttribute("data-tab");

          // Update active tab
          mobileTabs.forEach((t) => t.classList.remove("active"));
          this.classList.add("active");

          // Show corresponding tab content
          mobileTabContents.forEach((content) =>
            content.classList.remove("active")
          );
          document.getElementById(`${tabId}-tab`).classList.add("active");
        });
      });
    }

    function initStepNavigation() {
      // Previous step button
      prevStepBtn.addEventListener("click", function () {
        if (currentSectionIndex > 0) {
          navigateToSectionByIndex(currentSectionIndex - 1);
        }
      });

      // Next step button
      nextStepBtn.addEventListener("click", function () {
        // If we're in the content section, navigate through tabs first
        if (currentSectionIndex === 2) {
          // content-section is index 2
          const currentActiveTab = document.querySelector(".mobile-tab.active");
          if (currentActiveTab) {
            const tabId = currentActiveTab.getAttribute("data-tab");

            // Define the tab order
            const tabOrder = ["tasks", "requirements", "preferredSkills"];
            const currentTabIndex = tabOrder.indexOf(tabId);

            // If not on the last tab, go to next tab
            if (currentTabIndex < tabOrder.length - 1) {
              activateMobileTab(tabOrder[currentTabIndex + 1]);
              return; // Exit the function to prevent section navigation
            }
            // If on the last tab, continue to next section
          }
        }

        // Default behavior: go to next section
        if (currentSectionIndex < sectionIds.length - 1) {
          navigateToSectionByIndex(currentSectionIndex + 1);
        }
      });
    }

    function initPopups() {
      // Close popups when clicking the close button
      popupCloseButtons.forEach((button) => {
        button.addEventListener("click", function () {
          const popup = this.closest(".popup");
          popup.classList.remove("visible");
        });
      });

      // Close popups when clicking outside
      document.addEventListener("click", function (e) {
        const popups = document.querySelectorAll(".popup");
        popups.forEach((popup) => {
          if (e.target === popup) {
            popup.classList.remove("visible");
          }
        });
      });
    }

    function initFormElements() {
      // Auto-expand textareas
      document.querySelectorAll("textarea").forEach((textarea) => {
        textarea.addEventListener("input", () => autoExpandTextarea(textarea));
        autoExpandTextarea(textarea);
      });
    }

    function initEventListeners() {
      // Sidebar navigation
      sidebarItems.forEach((item) => {
        item.addEventListener("click", function () {
          const sectionId = this.getAttribute("data-section");

          // Map sidebar section IDs to mobile section IDs
          const sectionMapping = {
            jobTitle: "jobTitle",
            company: "company",
            jobDetails: "content",
            requirements: "content",
            preferredSkills: "content",
            details: "details",
            extraInfo: "details",
          };

          const mappedSectionId = sectionMapping[sectionId] || sectionId;

          // For content section, activate the correct tab
          if (mappedSectionId === "content") {
            if (sectionId === "jobDetails") {
              activateMobileTab("tasks");
            } else if (sectionId === "requirements") {
              activateMobileTab("requirements");
            } else if (sectionId === "preferredSkills") {
              activateMobileTab("preferredSkills");
            }
          }

          navigateToSection(mappedSectionId);
        });
      });

      // Job title selection
      jobTitleSelect.addEventListener("change", function () {
        const jobTitle = this.value;
        if (jobTitle && jobTitle !== "Eget") {
          generateInitialData(jobTitle);
        }
      });

      // Custom title generation
      generateCustomBtn.addEventListener("click", function () {
        const customTitle = customTitleInput.value.trim();
        if (customTitle) {
          generateInitialData(customTitle);
        } else {
          showError("Vänligen ange en egen titel");
        }
      });

      // Reset job title
      const resetLink = document.querySelector(".reset-link");
      if (resetLink) {
        resetLink.addEventListener("click", resetJobTitleSelection);
      }

      // Next step after job title
      const nextStep = document.querySelector(".next-step");
      if (nextStep) {
        nextStep.addEventListener("click", function () {
          navigateToSection("company");
        });
      }

      // Generate final listing buttons
      if (generateFinalBtn) {
        generateFinalBtn.addEventListener("click", validateAndGenerate);
      }

      if (mobileGenerateBtn) {
        mobileGenerateBtn.addEventListener("click", validateAndGenerate);
      }

      if (generateFromMoreMenuBtn) {
        generateFromMoreMenuBtn.addEventListener("click", validateAndGenerate);
      }

      // Copy button
      copyButton.addEventListener("click", async function () {
        try {
          await navigator.clipboard.writeText(richTextEditor.innerText);
          const originalText = this.textContent;
          this.textContent = "Kopierat!";
          setTimeout(() => (this.textContent = originalText), 2000);
        } catch (err) {
          console.error("Failed to copy text:", err);
        }
      });

      // Style buttons
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

      // Validation popup buttons
      const continueAnyway = document.getElementById("continueAnyway");
      const fillMissingInfo = document.getElementById("fillMissingInfo");

      if (continueAnyway) {
        continueAnyway.addEventListener("click", function () {
          validationPopup.classList.remove("visible");
          generateFinalListing();
        });
      }

      if (fillMissingInfo) {
        fillMissingInfo.addEventListener("click", function () {
          validationPopup.classList.remove("visible");
          const missingFields = validateForm();
          if (missingFields.length > 0) {
            navigateToMissingField(missingFields[0]);
          }
        });
      }
    }

    function activateMobileTab(tabId) {
      // Activate the correct tab in content section
      mobileTabs.forEach((tab) => {
        tab.classList.remove("active");
        if (tab.getAttribute("data-tab") === tabId) {
          tab.classList.add("active");
        }
      });

      // Show the corresponding tab content
      mobileTabContents.forEach((content) => {
        content.classList.remove("active");
      });
      document.getElementById(`${tabId}-tab`).classList.add("active");
    }

    function navigateToSection(sectionId) {
      // Hide all sections
      sections.forEach((section) => {
        section.classList.remove("active");
      });

      // Show the target section
      const targetSection = document.getElementById(`${sectionId}-section`);
      if (targetSection) {
        targetSection.classList.add("active");

        // Update sidebar
        sidebarItems.forEach((item) => {
          item.classList.remove("active");
        });

        // Map mobile section IDs to sidebar section IDs
        const sidebarMapping = {
          jobTitle: "jobTitle",
          company: "company",
          content: "jobDetails", // Default to jobDetails for content section
          details: "details",
        };

        const sidebarId = sidebarMapping[sectionId] || sectionId;
        const sidebarItem = document.querySelector(
          `.sidebar-item[data-section="${sidebarId}"]`
        );
        if (sidebarItem) {
          sidebarItem.classList.add("active");
        }

        // Update mobile navigation
        updateMobileNavForSection(sectionId);

        // Update progress steps
        updateProgressIndicator(sectionId);

        // Update current section index
        currentSectionIndex = sectionIds.indexOf(`${sectionId}-section`);

        // Update prev/next buttons
        updateStepButtons();

        // Show generate button on final step
        if (sectionId === "details") {
          if (mobileGenerateBtn) {
            mobileGenerateBtn.style.display = "block";
          }
        } else {
          if (mobileGenerateBtn) {
            mobileGenerateBtn.style.display = "none";
          }
        }
      }
    }

    function navigateToSectionByIndex(index) {
      if (index >= 0 && index < sectionIds.length) {
        const sectionId = sectionIds[index].replace("-section", "");
        navigateToSection(sectionId);
      }
    }

    function navigateToMissingField(fieldName) {
      const sectionMapping = {
        "Information om företaget": "company",
        "Plats/Ort": "company",
        Arbetsuppgifter: "content",
        Kvalifikationer: "content",
        "Meriterande egenskaper": "content",
        Anställningsform: "details",
        "Sista ansökningsdag": "details",
        Kontaktinformation: "details",
        "Extra information": "details",
      };

      const sectionId = sectionMapping[fieldName];
      if (sectionId) {
        navigateToSection(sectionId);

        // For content section, activate the correct tab
        if (sectionId === "content") {
          if (fieldName === "Arbetsuppgifter") {
            activateMobileTab("tasks");
          } else if (fieldName === "Kvalifikationer") {
            activateMobileTab("requirements");
          } else if (fieldName === "Meriterande egenskaper") {
            activateMobileTab("preferredSkills");
          }
        }
      }
    }

    function updateMobileNavForSection(sectionId) {
      mobileNavItems.forEach((navItem) => {
        const itemId = navItem.getAttribute("data-section");
        const navLink = navItem.querySelector(".mobile-nav-link");

        if (itemId === sectionId) {
          navLink.classList.add("active");
        } else {
          navLink.classList.remove("active");
        }
      });
    }

    function updateStepButtons() {
      // Enable/disable previous button
      prevStepBtn.disabled = currentSectionIndex === 0;

      // Enable/disable next button
      nextStepBtn.disabled = currentSectionIndex === sectionIds.length - 1;

      // Show/hide buttons based on current section
      if (currentSectionIndex === sectionIds.length - 1) {
        nextStepBtn.style.display = "none";
      } else {
        nextStepBtn.style.display = "block";
      }
    }

    function updateProgressIndicator(sectionId) {
      const stepMapping = {
        jobTitle: 0,
        company: 1,
        content: 2,
        details: 3,
      };

      const currentStep = stepMapping[sectionId] || 0;

      progressSteps.forEach((step, index) => {
        step.classList.remove("active", "completed");

        if (index < currentStep) {
          step.classList.add("completed");
        } else if (index === currentStep) {
          step.classList.add("active");
        }
      });
    }

    function showError(message) {
      errorMessage.textContent = message;
      errorMessage.style.display = "block";
      loadingIndicator.classList.remove("visible");
    }

    function clearError() {
      errorMessage.style.display = "none";
    }

    function showLoadingOverlay(message = "Genererar förslag...") {
      const loadingText = loadingIndicator.querySelector(".loading-text");
      if (loadingText) {
        loadingText.textContent = message;
      }
      loadingIndicator.classList.add("visible");
    }

    function hideLoadingOverlay() {
      loadingIndicator.classList.remove("visible");
    }

    async function generateInitialData(jobTitle) {
      clearError();
      showLoadingOverlay();
      generatedText.value = "";

      try {
        // Update job title success message
        const jobTitleSuccess = document.getElementById("jobTitleSuccess");
        const titleDisplay = jobTitleSuccess.querySelector(".title-display");
        titleDisplay.textContent = jobTitle;
        jobTitleSuccess.style.display = "block";

        // Hide job title input fields
        const jobTitleSelect = document.getElementById("jobTitle");
        const customTitleInput = document.getElementById("customTitle");
        const generateCustomBtn = document.getElementById("generateCustom");
        const titleFormGroups = document.querySelectorAll(
          "#jobTitle-section .form-group"
        );

        // Hide the form groups containing the inputs
        titleFormGroups.forEach((group) => {
          group.style.display = "none";
        });

        // Make API request
        const response = await fetch(`${API_BASE_URL}/generate-initial-data`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobTitle }),
        });

        if (response.status === 429) {
          const errorData = await response.json();
          throw new Error(
            `Rate limit exceeded: ${
              errorData.message || "Too many requests. Please try again later."
            }`
          );
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Server error: ${errorData.error || response.statusText}`
          );
        }

        const data = await response.json();

        // Update checkbox containers
        Object.entries(data).forEach(([key, items]) => {
          if (containers[key] && items && items.length > 0) {
            containers[key].innerHTML = items
              .map((item) => createCheckboxItem(item))
              .join("");
          }
        });

        // Show success message
        const suggestionsGenerated = document.getElementById(
          "suggestionsGenerated"
        );
        suggestionsGenerated.style.display = "block";

        // Update sidebar items to show they have content
        updateSidebarItems();

        // Update empty section messages
        updateEmptySectionMessages();
      } catch (error) {
        console.error("Error details:", error);
        showError(`Ett fel uppstod: ${error.message}`);

        // Show the form groups again in case of error
        const titleFormGroups = document.querySelectorAll(
          "#jobTitle-section .form-group"
        );
        titleFormGroups.forEach((group) => {
          group.style.display = "block";
        });
      } finally {
        hideLoadingOverlay();
      }
    }

    function createCheckboxItem(text) {
      return `
        <div class="checkbox-item">
          <input type="checkbox" id="${text.replace(/\s+/g, "_")}" checked>
          <label for="${text.replace(/\s+/g, "_")}">${text}</label>
        </div>
      `;
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
          sidebarItem.classList.add("has-content");
        }
      });
    }

    function setupAddItemHandlers() {
      // Direct button click handlers for tasks
      const tasksInput = document.getElementById("tasksInput");
      const addTaskButton = document.getElementById("addTaskButton");

      if (tasksInput && addTaskButton && containers.tasks) {
        addTaskButton.addEventListener("click", function () {
          addItemToContainer(tasksInput, containers.tasks);
        });

        tasksInput.addEventListener("keypress", function (e) {
          if (e.key === "Enter") {
            e.preventDefault();
            addItemToContainer(tasksInput, containers.tasks);
          }
        });
      }

      // Direct button click handlers for requirements
      const requirementsInput = document.getElementById("requirementsInput");
      const addRequirementButton = document.getElementById(
        "addRequirementButton"
      );

      if (
        requirementsInput &&
        addRequirementButton &&
        containers.requirements
      ) {
        addRequirementButton.addEventListener("click", function () {
          addItemToContainer(requirementsInput, containers.requirements);
        });

        requirementsInput.addEventListener("keypress", function (e) {
          if (e.key === "Enter") {
            e.preventDefault();
            addItemToContainer(requirementsInput, containers.requirements);
          }
        });
      }

      // Direct button click handlers for preferred skills
      const preferredSkillsInput = document.getElementById(
        "preferredSkillsInput"
      );
      const addPreferredSkillButton = document.getElementById(
        "addPreferredSkillButton"
      );

      if (
        preferredSkillsInput &&
        addPreferredSkillButton &&
        containers.preferredSkills
      ) {
        addPreferredSkillButton.addEventListener("click", function () {
          addItemToContainer(preferredSkillsInput, containers.preferredSkills);
        });

        preferredSkillsInput.addEventListener("keypress", function (e) {
          if (e.key === "Enter") {
            e.preventDefault();
            addItemToContainer(
              preferredSkillsInput,
              containers.preferredSkills
            );
          }
        });
      }
    }

    function addItemToContainer(inputElement, container) {
      const value = inputElement.value.trim();
      if (value) {
        const itemId = value.replace(/\s+/g, "_");
        const checkboxItem = document.createElement("div");
        checkboxItem.className = "checkbox-item";

        checkboxItem.innerHTML = `
          <input type="checkbox" id="${itemId}" checked>
          <label for="${itemId}">${value}</label>
        `;

        container.appendChild(checkboxItem);
        inputElement.value = "";

        console.log(`Added item "${value}" to container`, container);

        // Update sidebar to show section has content
        let sectionId;
        if (container === containers.tasks) {
          sectionId = "jobDetails";
        } else if (container === containers.requirements) {
          sectionId = "requirements";
        } else if (container === containers.preferredSkills) {
          sectionId = "preferredSkills";
        }

        if (sectionId) {
          const sidebarItem = document.querySelector(
            `.sidebar-item[data-section="${sectionId}"]`
          );
          if (sidebarItem) {
            sidebarItem.classList.add("has-content");
          }
        }

        // Update empty section messages
        updateEmptySectionMessages();
      }
    }

    function resetJobTitleSelection() {
      jobTitleSelect.value = "";
      customTitleInput.value = "";

      const jobTitleSuccess = document.getElementById("jobTitleSuccess");
      jobTitleSuccess.style.display = "none";

      const suggestionsGenerated = document.getElementById(
        "suggestionsGenerated"
      );
      suggestionsGenerated.style.display = "none";

      // Clear any error messages
      clearError();

      // Show job title input fields again
      const titleFormGroups = document.querySelectorAll(
        "#jobTitle-section .form-group"
      );
      titleFormGroups.forEach((group) => {
        group.style.display = "block";
      });

      // Clear checkbox containers
      Object.values(containers).forEach((container) => {
        if (container) {
          container.innerHTML = "";
        }
      });

      // Update empty section messages
      updateEmptySectionMessages();
    }

    function validateAndGenerate() {
      const missingFields = validateForm();
      if (missingFields.length > 0) {
        showValidationPopup(missingFields);
      } else {
        generateFinalListing();
      }
    }

    function validateForm() {
      const missingFields = [];

      if (!textInputs.about.value.trim()) {
        missingFields.push("Information om företaget");
      }

      if (!textInputs.location.value.trim()) {
        missingFields.push("Plats/Ort");
      }

      if (containers.tasks.children.length === 0) {
        missingFields.push("Arbetsuppgifter");
      }

      if (containers.requirements.children.length === 0) {
        missingFields.push("Kvalifikationer");
      }

      if (!textInputs.employmentType.value.trim()) {
        missingFields.push("Anställningsform");
      }

      if (!textInputs.applyDay.value.trim()) {
        missingFields.push("Sista ansökningsdag");
      }

      if (!textInputs.contact.value.trim()) {
        missingFields.push("Kontaktinformation");
      }

      return missingFields;
    }

    function showValidationPopup(missingFields) {
      const missingFieldsList = document.getElementById("missingFieldsList");
      missingFieldsList.innerHTML = "";

      missingFields.forEach((field) => {
        const li = document.createElement("li");
        li.textContent = field;
        missingFieldsList.appendChild(li);
      });

      validationPopup.classList.add("visible");
    }

    async function generateFinalListing() {
      showLoadingOverlay("Genererar jobbannons...");

      const jobTitle = jobTitleSelect.value;
      const customTitle = customTitleInput.value.trim();
      const title = jobTitle === "Eget" ? customTitle : jobTitle;

      const data = {
        title,
        about: [textInputs.about.value.trim()],
        location: [textInputs.location.value.trim()],
        tasks: getCheckedItems("tasks"),
        requirements: getCheckedItems("requirements"),
        preferredSkills: getCheckedItems("preferredSkills"),
        employmentType: [textInputs.employmentType.value.trim()],
        applyDay: [textInputs.applyDay.value.trim()],
        contact: [textInputs.contact.value.trim()],
        extraInfo: [textInputs.extraInfo.value.trim()],
      };

      try {
        const response = await fetch(`${API_BASE_URL}/generate-final-listing`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.listing) {
          generatedText.value = result.listing;
          richTextEditor.innerHTML = markdownToHtml(result.listing);
          generatedContent.style.display = "block";

          // Scroll to generated content
          generatedContent.scrollIntoView({ behavior: "smooth" });
        } else {
          throw new Error("Kunde inte generera jobbannons.");
        }
      } catch (error) {
        console.error("Error:", error);
        showError(`Ett fel uppstod: ${error.message}`);
      } finally {
        hideLoadingOverlay();
      }
    }

    async function updateTextStyle(style) {
      showLoadingOverlay(
        `Jobbar med att ändra stilen till mer ${style.toLowerCase()}...`
      );

      try {
        const text = richTextEditor.innerText;

        const response = await fetch(`${API_BASE_URL}/update-style`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, style }),
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.updated_text) {
          generatedText.value = result.updated_text;
          richTextEditor.innerHTML = markdownToHtml(result.updated_text);
        } else {
          throw new Error("Kunde inte uppdatera textstilen.");
        }
      } catch (error) {
        console.error("Error:", error);
        showError(`Ett fel uppstod: ${error.message}`);
      } finally {
        hideLoadingOverlay();
      }
    }

    function getCheckedItems(containerId) {
      const container = document.getElementById(containerId);
      const checkedItems = [];

      if (container) {
        const checkboxes = container.querySelectorAll(
          "input[type='checkbox']:checked"
        );
        checkboxes.forEach((checkbox) => {
          const label = checkbox.nextElementSibling;
          if (label) {
            checkedItems.push(label.textContent.trim());
          }
        });
      }

      return checkedItems;
    }

    function markdownToHtml(text) {
      if (!text) return "";

      text = text.replace(/^# (.*?)$/gm, "<h1>$1</h1>");
      text = text.replace(/^## (.*?)$/gm, "<h2>$1</h2>");
      text = text.replace(/^### (.*?)$/gm, "<h3>$1</h3>");
      text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");
      text = text.replace(/\n/g, "<br>");

      // Handle lists
      text = text.replace(/^\- (.*?)$/gm, "<li>$1</li>");
      text = text.replace(/(<li>.*?<\/li>)+/g, "<ul>$&</ul>");

      return text;
    }
  });
})();
