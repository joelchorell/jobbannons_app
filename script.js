document.getElementById("jobTitle").addEventListener("change", function () {
  let jobTitle = this.value;
  let customTitleInput = document.getElementById("customTitle");

  if (jobTitle === "Eget") {
    customTitleInput.style.display = "block";
    return;
  } else {
    customTitleInput.style.display = "none";
  }

  document.querySelector(".loading").style.display = "block";
  fetch("https://dinserver.com/generate-job-data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobTitle: jobTitle }),
  })
    .then((response) => response.json())
    .then((data) => {
      document.querySelector(".loading").style.display = "none";

      document.getElementById("tasks").innerHTML = data.tasks
        .map((task) => `<label><input type="checkbox" checked> ${task}</label>`)
        .join("");

      document.getElementById("requirements").innerHTML = data.requirements
        .map((req) => `<label><input type="checkbox" checked> ${req}</label>`)
        .join("");

      document.getElementById("preferredSkills").innerHTML =
        data.preferred_skills
          .map(
            (skill) => `<label><input type="checkbox" checked> ${skill}</label>`
          )
          .join("");
    });
});
