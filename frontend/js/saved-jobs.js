import { supabase } from "./supabase.js";

// Initialize the saved jobs functionality
export function initSavedJobs() {
  setupSaveJobButton();
  setupLoadJobsButton();
}

// Setup save job button
function setupSaveJobButton() {
  const saveJobBtn = document.getElementById("saveJobBtn");
  if (!saveJobBtn) return;

  saveJobBtn.addEventListener("click", async function () {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      document.getElementById("loginPopup").classList.add("visible");
      return;
    }

    try {
      window.showLoadingOverlay("Sparar jobbannons...");

      // Get form data
      const jobTitle =
        document.getElementById("jobTitle").value === "Eget"
          ? document.getElementById("customTitle").value.trim()
          : document.getElementById("jobTitle").value;

      const textInputs = {
        about: document.getElementById("aboutInput").value.trim(),
        location: document.getElementById("locationInput").value.trim(),
        employmentType: document
          .getElementById("employmentTypeInput")
          .value.trim(),
        applyDay: document.getElementById("applyDayInput").value.trim(),
        contact: document.getElementById("contactInput").value.trim(),
        extraInfo: document.getElementById("extraInfoInput").value.trim(),
      };

      const formData = {
        title: jobTitle,
        about: textInputs.about,
        location: textInputs.location,
        tasks: getCheckedItems("tasks"),
        requirements: getCheckedItems("requirements"),
        preferredSkills: getCheckedItems("preferredSkills"),
        employmentType: textInputs.employmentType,
        applyDay: textInputs.applyDay,
        contact: textInputs.contact,
        extraInfo: textInputs.extraInfo,
      };

      // Save to database
      const { error } = await supabase.from("saved_jobs").insert([
        {
          user_id: session.user.id,
          title: jobTitle,
          content: document.getElementById("generatedText").value,
          form_data: formData,
        },
      ]);

      if (error) throw error;

      window.showSuccess("Jobbannons sparad!");
    } catch (error) {
      window.showError(`Ett fel uppstod: ${error.message}`);
    } finally {
      window.hideLoadingOverlay();
    }
  });
}

// Setup load jobs button
function setupLoadJobsButton() {
  document.addEventListener("click", async function (e) {
    if (e.target && e.target.id === "loadJobsBtn") {
      e.preventDefault();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        document.getElementById("loginPopup").classList.add("visible");
        return;
      }

      try {
        window.showLoadingOverlay("Hämtar sparade annonser...");

        const { data, error } = await supabase
          .from("saved_jobs")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Show saved jobs
        showSavedJobs(data);
      } catch (error) {
        window.showError(`Ett fel uppstod: ${error.message}`);
      } finally {
        window.hideLoadingOverlay();
      }
    }
  });
}

// Show saved jobs in a modal
function showSavedJobs(jobs) {
  const modal = document.getElementById("savedJobsModal");
  const content = document.getElementById("savedJobsContent");

  if (jobs.length === 0) {
    content.innerHTML = "<p>Du har inga sparade annonser.</p>";
  } else {
    let html = '<h3>Mina sparade annonser</h3><div class="saved-jobs-list">';

    jobs.forEach((job) => {
      html += `
        <div class="saved-job-item" data-id="${job.id}">
          <div class="saved-job-info">
            <h4>${job.title}</h4>
            <span>${new Date(job.created_at).toLocaleDateString()}</span>
          </div>
          <div class="saved-job-actions">
            <button class="btn btn-sm load-job">Ladda</button>
            <button class="btn btn-sm btn-secondary delete-job">Ta bort</button>
          </div>
        </div>
      `;
    });

    html += "</div>";
    content.innerHTML = html;

    // Add event listeners
    content.querySelectorAll(".load-job").forEach((btn) => {
      btn.addEventListener("click", function () {
        const jobId = this.closest(".saved-job-item").dataset.id;
        loadSavedJob(jobId);
        modal.classList.remove("visible");
      });
    });

    content.querySelectorAll(".delete-job").forEach((btn) => {
      btn.addEventListener("click", function () {
        const item = this.closest(".saved-job-item");
        const jobId = item.dataset.id;

        if (confirm("Är du säker på att du vill ta bort denna annons?")) {
          deleteSavedJob(jobId).then((success) => {
            if (success) {
              item.remove();
              if (content.querySelector(".saved-job-item") === null) {
                content.innerHTML = "<p>Du har inga sparade annonser.</p>";
              }
            }
          });
        }
      });
    });
  }

  modal.classList.add("visible");
}

// Load a saved job
async function loadSavedJob(jobId) {
  try {
    window.showLoadingOverlay("Laddar jobbannons...");

    const { data, error } = await supabase
      .from("saved_jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (error) throw error;

    // Reset form
    window.resetJobTitleSelection();

    // Fill form with saved data
    const formData = data.form_data;

    // Set title
    const jobTitleSelect = document.getElementById("jobTitle");
    const customTitleInput = document.getElementById("customTitle");

    if (jobTitleSelect.querySelector(`option[value="${formData.title}"]`)) {
      jobTitleSelect.value = formData.title;
    } else {
      jobTitleSelect.value = "Eget";
      customTitleInput.value = formData.title;
    }

    // Set text fields
    document.getElementById("aboutInput").value = formData.about || "";
    document.getElementById("locationInput").value = formData.location || "";
    document.getElementById("employmentTypeInput").value =
      formData.employmentType || "";
    document.getElementById("applyDayInput").value = formData.applyDay || "";
    document.getElementById("contactInput").value = formData.contact || "";
    document.getElementById("extraInfoInput").value = formData.extraInfo || "";

    // Set checkbox items
    const containers = {
      tasks: document.getElementById("tasks"),
      requirements: document.getElementById("requirements"),
      preferredSkills: document.getElementById("preferredSkills"),
    };

    if (formData.tasks && formData.tasks.length) {
      containers.tasks.innerHTML = formData.tasks
        .map((task) => createCheckboxItem(task))
        .join("");
    }

    if (formData.requirements && formData.requirements.length) {
      containers.requirements.innerHTML = formData.requirements
        .map((req) => createCheckboxItem(req))
        .join("");
    }

    if (formData.preferredSkills && formData.preferredSkills.length) {
      containers.preferredSkills.innerHTML = formData.preferredSkills
        .map((skill) => createCheckboxItem(skill))
        .join("");
    }

    // Update empty state messages
    window.updateEmptySectionMessages();

    // Load content
    const generatedText = document.getElementById("generatedText");
    const richTextEditor = document.getElementById("richTextEditor");
    const generatedContent = document.getElementById("generatedContent");

    generatedText.value = data.content;
    richTextEditor.innerHTML = window.markdownToHtml(data.content);
    generatedContent.style.display = "block";

    window.showSuccess("Jobbannons laddad!");
  } catch (error) {
    window.showError(`Ett fel uppstod: ${error.message}`);
  } finally {
    window.hideLoadingOverlay();
  }
}

// Delete a saved job
async function deleteSavedJob(jobId) {
  try {
    const { error } = await supabase
      .from("saved_jobs")
      .delete()
      .eq("id", jobId);

    if (error) throw error;

    return true;
  } catch (error) {
    window.showError(`Kunde inte ta bort annonsen: ${error.message}`);
    return false;
  }
}

// Helper functions
function getCheckedItems(containerId) {
  const container = document.getElementById(containerId);
  const checkedItems = [];

  if (container) {
    const checkboxes = container.querySelectorAll(
      'input[type="checkbox"]:checked'
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

function createCheckboxItem(text) {
  return `
    <div class="checkbox-item">
      <input type="checkbox" id="${text.replace(/\s+/g, "_")}" checked>
      <label for="${text.replace(/\s+/g, "_")}">${text}</label>
    </div>
  `;
}

// Auto-initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initSavedJobs();
});
