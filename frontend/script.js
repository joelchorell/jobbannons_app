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
  ];

  const generatedText = document.getElementById("generatedText");
  const copyButton = document.getElementById("copyButton");

  const professionalBtn = document.getElementById("professionalBtn");
  const joyfulBtn = document.getElementById("joyfulBtn");
  const conciseBtn = document.getElementById("conciseBtn");

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
    generateFinalBtn.textContent = "Genererar...";
    generateFinalBtn.style.animation =
      "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite";
    generateFinalBtn.disabled = true;

    try {
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
        extraInfo: [document.getElementById("extraInfoInput").value],
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

      if (result.listing) {
        // Store plain text in hidden textarea for copying
        generatedText.value = result.listing;

        // Show formatted text in the div
        const formattedText = document.getElementById("formattedText");
        formattedText.innerHTML = markdownToHtml(result.listing);

        // Show the generated content section
        document.querySelector(".generated-content").classList.add("visible");
      } else {
        throw new Error("No listing content in response");
      }
    } catch (error) {
      console.error("Error details:", error);
      showError(`Ett fel uppstod: ${error.message}`);
    } finally {
      generateFinalBtn.textContent = "Generera Annons";
      generateFinalBtn.style.animation = "";
      generateFinalBtn.disabled = false;
    }
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
});

// Add this function to convert markdown to HTML
function markdownToHtml(text) {
  return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}
