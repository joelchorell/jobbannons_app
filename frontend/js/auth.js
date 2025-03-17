import { supabase } from "./supabase.js";

// Initialize the auth functionality
export function initAuth() {
  // Setup auth forms
  setupAuthTabs();
  setupLoginForm();
  setupRegisterForm();
  setupPasswordReset();

  // Add login button functionality
  const loginButton = document.querySelector(".login-button");
  if (loginButton) {
    loginButton.addEventListener("click", function (e) {
      e.preventDefault();
      document.getElementById("loginPopup").classList.add("visible");
    });
  }

  // Check for existing session
  checkSession();
}

// Setup auth tabs
function setupAuthTabs() {
  const authTabs = document.querySelectorAll(".auth-tab");
  const authForms = document.querySelectorAll(".auth-form");

  authTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const tabId = this.getAttribute("data-tab");

      // Update active tab
      authTabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      // Show corresponding form
      authForms.forEach((form) => {
        form.style.display = "none";
      });
      document.getElementById(`${tabId}Form`).style.display = "block";
    });
  });
}

// Setup login form
function setupLoginForm() {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      window.showLoadingOverlay("Loggar in...");

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Close login popup
      document.getElementById("loginPopup").classList.remove("visible");
    } catch (error) {
      window.showError(`Inloggningen misslyckades: ${error.message}`);
    } finally {
      window.hideLoadingOverlay();
    }
  });
}

// Setup register form
function setupRegisterForm() {
  const registerForm = document.getElementById("registerForm");
  if (!registerForm) return;

  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const company = document.getElementById("registerCompany").value;
    const password = document.getElementById("registerPassword").value;

    try {
      window.showLoadingOverlay("Skapar konto...");

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, company },
        },
      });

      if (error) throw error;

      // Create a profile for the user
      if (data?.user) {
        await createUserProfile(data.user.id, name, company);
      }

      // Close login popup
      document.getElementById("loginPopup").classList.remove("visible");

      window.showSuccess(
        "Konto skapat! Kontrollera din e-post för verifieringslänk."
      );
    } catch (error) {
      window.showError(`Registreringen misslyckades: ${error.message}`);
    } finally {
      window.hideLoadingOverlay();
    }
  });
}

// Create a user profile in the database
async function createUserProfile(userId, name, company) {
  try {
    const { error } = await supabase
      .from("profiles")
      .insert([{ id: userId, name, company, subscription_tier: "free" }]);

    if (error) throw error;
  } catch (error) {
    console.error("Error creating profile:", error);
    // Continue anyway - the profile will be created on first login if missing
  }
}

// Setup password reset functionality
function setupPasswordReset() {
  const forgotPasswordLink = document.getElementById("forgotPassword");
  if (!forgotPasswordLink) return;

  forgotPasswordLink.addEventListener("click", async function (e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    if (!email) {
      window.showError("Vänligen ange din e-postadress först");
      return;
    }

    try {
      window.showLoadingOverlay("Skickar återställningslänk...");

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password.html`,
      });

      if (error) throw error;

      window.showSuccess("En återställningslänk har skickats till din e-post");
    } catch (error) {
      window.showError(
        `Kunde inte skicka återställningslänk: ${error.message}`
      );
    } finally {
      window.hideLoadingOverlay();
    }
  });
}

// Check for existing session
async function checkSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    try {
      // Get user profile
      let { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      // Create profile if it doesn't exist
      if (!profile) {
        const { name, company } = session.user.user_metadata || {};

        await supabase.from("profiles").insert([
          {
            id: session.user.id,
            name: name || session.user.email.split("@")[0],
            company: company || "",
            subscription_tier: "free",
          },
        ]);

        profile = {
          name: name || session.user.email.split("@")[0],
          company: company || "",
          subscription_tier: "free",
        };
      }

      updateUIForLoggedInUser(profile);
    } catch (error) {
      console.error("Error getting user profile:", error);
    }
  }
}

// Update UI for logged in user
export function updateUIForLoggedInUser(profile) {
  // Update header - replace login button with user menu
  const navMenu = document.querySelector("nav ul");
  const loginButton = navMenu.querySelector(".login-button");

  if (loginButton) {
    const loginItem = loginButton.parentElement;
    loginItem.innerHTML = `
      <div class="user-menu">
        <div class="user-display">
          <div class="user-avatar">${profile.name
            .substring(0, 2)
            .toUpperCase()}</div>
          <span class="user-name">${profile.name}</span>
        </div>
        <div class="user-dropdown">
          <a href="#" id="myProfileBtn">Min profil</a>
          <a href="#" id="loadJobsBtn">Mina annonser</a>
          <a href="#" id="logoutBtn">Logga ut</a>
        </div>
      </div>
    `;

    // Setup logout functionality
    document
      .getElementById("logoutBtn")
      .addEventListener("click", async function (e) {
        e.preventDefault();
        await supabase.auth.signOut();
        window.location.reload();
      });
  }

  // Show elements that require authentication
  document.querySelectorAll(".requires-auth").forEach((el) => {
    el.style.display = "block";
  });
}

// Auto-initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initAuth();
});
