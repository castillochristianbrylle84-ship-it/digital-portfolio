(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const data = window.PORTFOLIO_DATA || {};

  // Escape text so typed content can never inject HTML.
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // Only allow http(s) links.
  const safeUrl = (u) => (/^https?:\/\//i.test(u || "") ? u : "");

  /* ---------- Render ---------- */
  function render() {
    const p = data.profile || {};
    document.title = (p.name ? p.name + " | " : "") + "Portfolio";
    $("#navName").textContent = p.name || "Portfolio";
    $("#name").textContent = p.name || "Your Name";
    $("#title").textContent = p.title || "";
    $("#bio").textContent = p.bio || "";
    $("#location").textContent = p.location || "";
    $("#year").textContent = "© " + new Date().getFullYear() + " " + (p.name || "");

    const photo = $("#photo");
    if (p.photo) { photo.src = p.photo; photo.hidden = false; } else { photo.hidden = true; }

    $("#education").textContent = p.education || "";
    $("#skills").innerHTML = (p.skills || []).length
      ? p.skills.map((s) => `<span class="chip">${esc(s)}</span>`).join("")
      : '<span class="empty">No skills added yet.</span>';

    $("#projectGrid").innerHTML = (data.projects || []).length
      ? data.projects.map((x) => {
          const link = safeUrl(x.link), repo = safeUrl(x.repo);
          return `<article class="card">
            ${x.image ? `<img src="${esc(x.image)}" alt="${esc(x.title)} screenshot" loading="lazy" />` : ""}
            <div class="body">
              <h3>${esc(x.title)}</h3>
              <p>${esc(x.description)}</p>
              ${(x.tech || []).length ? `<div class="chips">${x.tech.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>` : ""}
              <div class="links">
                ${link ? `<a href="${esc(link)}" target="_blank" rel="noopener">Live demo ↗</a>` : ""}
                ${repo ? `<a href="${esc(repo)}" target="_blank" rel="noopener">Code ↗</a>` : ""}
              </div>
            </div></article>`;
        }).join("")
      : '<p class="empty">No projects yet.</p>';

    $("#certGrid").innerHTML = (data.certificates || []).length
      ? data.certificates.map((x) => {
          const link = safeUrl(x.link);
          const file = x.file || "";
          return `<article class="card">
            ${x.image ? `<img src="${esc(x.image)}" alt="${esc(x.title)} certificate" loading="lazy" />` : ""}
            ${!x.image && file ? `<iframe class="certificate-document" src="${esc(file)}#page=1&view=FitH&toolbar=0&navpanes=0" title="Preview of ${esc(x.title)}" loading="lazy"><a href="${esc(file)}" target="_blank" rel="noopener">Open certificate</a></iframe>` : ""}
            <div class="body">
              <h3>${esc(x.title)}</h3>
              <p>${esc([x.issuer, x.date].filter(Boolean).join(" · "))}</p>
              <div class="links">
                ${file ? `<a href="${esc(file)}" target="_blank" rel="noopener">View certificate ↗</a><a href="${esc(file)}" download="${esc(x.filename || "Certificate.pdf")}">Download PDF ↓</a>` : ""}
                ${link ? `<a href="${esc(link)}" target="_blank" rel="noopener">Verify ↗</a>` : ""}
              </div>
            </div></article>`;
        }).join("")
      : '<p class="empty">No certificates yet.</p>';

    // Resume
    const resume = data.resume || {};
    const file = resume.file;
    const preview = resume.preview || (/\.pdf$/i.test(file || "") ? file : "");
    $("#resumeText").textContent = file ? "View a preview or download my latest resume below." : "No resume uploaded yet.";
    $("#viewResume").hidden = !preview;
    const dl = $("#downloadResume");
    dl.hidden = !file;
    if (file) {
      dl.href = file;
      dl.download = resume.name || (file.startsWith("data:") ? "Resume" : file.split(/[\\/]/).pop());
    }

    // Contact
    const links = [];
    if (p.phone) {
      links.push(`<p class="contact-detail">Phone number: ${esc(p.phone)}</p>`);
    }
    if (p.email) links.push(`<p class="contact-detail">Gmail: <a href="mailto:${esc(p.email)}">${esc(p.email)}</a></p>`);
    if (safeUrl(p.facebook)) links.push(`<p class="contact-detail">Facebook: <a href="${esc(p.facebook)}" target="_blank" rel="noopener">Christian Castillo</a></p>`);
    if (safeUrl(p.github)) links.push(`<p class="contact-detail">GitHub: <a href="${esc(p.github)}" target="_blank" rel="noopener">GitHub profile</a></p>`);
    if (safeUrl(p.linkedin)) links.push(`<p class="contact-detail">LinkedIn: <a href="${esc(p.linkedin)}" target="_blank" rel="noopener">LinkedIn profile</a></p>`);
    $("#contactLinks").innerHTML = links.join("") || '<span class="empty">Add your contact details.</span>';

  }

  /* ---------- Lightbox for images ---------- */
  document.addEventListener("click", (e) => {
    const img = e.target.closest(".card img");
    if (!img) return;
    const box = document.createElement("div");
    box.className = "lightbox";
    box.innerHTML = `<img src="${esc(img.src)}" alt="" />`;
    box.addEventListener("click", () => box.remove());
    document.body.appendChild(box);
  });

  /* ---------- Resume viewing ---------- */
  $("#viewResume").addEventListener("click", async () => {
    const resume = data.resume || {};
    const file = resume.preview || (/\.pdf$/i.test(resume.file || "") ? resume.file : "");
    if (!file) return;
    if (file.startsWith("data:")) {
      const blob = await (await fetch(file)).blob();
      window.open(URL.createObjectURL(new Blob([blob], { type: "application/pdf" })), "_blank", "noopener");
    } else {
      window.open(file, "_blank", "noopener");
    }
  });

  render();
})();
