(function () {
  "use strict";

  const STORAGE_KEY = "portfolio-data-v1";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const base = JSON.parse(JSON.stringify(window.PORTFOLIO_DATA || {}));
  let data = load();
  migrateMovedAssets();

  function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return Object.assign({ profile: {}, projects: [], certificates: [], resume: {} }, JSON.parse(saved));
    } catch (e) { /* ignore */ }
    return Object.assign({ profile: {}, projects: [], certificates: [], resume: {} }, JSON.parse(JSON.stringify(base)));
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      alert("Storage is full. Use smaller images, or add files to the assets folder and reference their paths in data.js.");
    }
  }

  function migrateMovedAssets() {
    let changed = false;
    const profile = data.profile || (data.profile = {});
    ["email", "phone", "facebook"].forEach((key) => {
      if (!profile[key] && base.profile[key]) {
        profile[key] = base.profile[key];
        changed = true;
      }
    });

    const certificatePaths = {
      "certificate java.pdf": "assets/certificates/certificate java.pdf",
      "batangas_bsit-303_castillo, christian brylle.pdf": "assets/certificates/Batangas_BSIT-303_CASTILLO, CHRISTIAN BRYLLE.pdf"
    };

    (data.certificates || []).forEach((certificate) => {
      const fileName = (certificate.file || "").split(/[\\/]/).pop().toLowerCase();
      const path = certificatePaths[fileName];
      if (path && certificate.file !== path) {
        certificate.file = path;
        changed = true;
      }
    });

    const resume = data.resume || {};
    if (resume.file && !resume.file.startsWith("data:")) {
      const fileName = resume.file.split(/[\\/]/).pop().toLowerCase();
      if (fileName === "resume.docx" || fileName === "castillo resume.docx") {
        if (resume.file !== "assets/resume/resume.docx") {
          resume.file = "assets/resume/resume.docx";
          changed = true;
        }
        if (resume.name !== "resume.docx") {
          resume.name = "resume.docx";
          changed = true;
        }
      }
    }

    if (resume.preview && !resume.preview.startsWith("data:")) {
      const fileName = resume.preview.split(/[\\/]/).pop().toLowerCase();
      if (fileName === "castillo resume.pdf" || fileName === "resume.pdf") {
        if (resume.preview !== "assets/resume/castillo resume.pdf") {
          resume.preview = "assets/resume/castillo resume.pdf";
          changed = true;
        }
      }
    }

    if (changed) save();
  }

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

    renderLists();
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

  /* ---------- Helpers ---------- */
  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  // Shrink images so they fit in browser storage.
  async function imageToDataUrl(file, maxW = 900) {
    const src = await fileToDataUrl(file);
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => resolve(src);
      img.src = src;
    });
  }

  const splitList = (s) => String(s || "").split(",").map((x) => x.trim()).filter(Boolean);

  /* ---------- Manager ---------- */
  const dlg = $("#manager");
  $("#openManager").addEventListener("click", () => { fillProfileForm(); dlg.showModal(); });
  $("#closeManager").addEventListener("click", () => dlg.close());

  $("#tabs").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-tab]");
    if (!b) return;
    $$("#tabs button").forEach((x) => x.classList.toggle("active", x === b));
    $$(".panel").forEach((p) => (p.hidden = p.dataset.panel !== b.dataset.tab));
  });

  function fillProfileForm() {
    const f = $("#profileForm"), p = data.profile || {};
    ["name", "title", "bio", "location", "email", "phone", "facebook", "github", "linkedin"].forEach((k) => (f.elements[k].value = p[k] || ""));
    f.elements.skills.value = (p.skills || []).join(", ");
    $("#resumeStatus").textContent = (data.resume || {}).file ? "A resume is currently set." : "No resume set.";
  }

  $("#profileForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target, p = data.profile || (data.profile = {});
    ["name", "title", "bio", "location", "email", "phone", "facebook", "github", "linkedin"].forEach((k) => (p[k] = f.elements[k].value.trim()));
    p.skills = splitList(f.elements.skills.value);
    const photo = f.elements.photo.files[0];
    if (photo) p.photo = await imageToDataUrl(photo, 400);
    f.elements.photo.value = "";
    save(); render();
  });

  $("#projectForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    const item = {
      title: f.elements.title.value.trim(),
      description: f.elements.description.value.trim(),
      tech: splitList(f.elements.tech.value),
      link: f.elements.link.value.trim(),
      repo: f.elements.repo.value.trim(),
      image: f.elements.image.files[0] ? await imageToDataUrl(f.elements.image.files[0]) : ""
    };
    (data.projects || (data.projects = [])).push(item);
    f.reset(); save(); render();
  });

  $("#certForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    const item = {
      title: f.elements.title.value.trim(),
      issuer: f.elements.issuer.value.trim(),
      date: f.elements.date.value.trim(),
      link: f.elements.link.value.trim(),
      image: f.elements.image.files[0] ? await imageToDataUrl(f.elements.image.files[0]) : ""
    };
    (data.certificates || (data.certificates = [])).push(item);
    f.reset(); save(); render();
  });

  $("#resumeFile").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!/\.(pdf|docx?)$/i.test(file.name)) return alert("Please choose a PDF or Word document.");
    const uploaded = await fileToDataUrl(file);
    data.resume = {
      file: uploaded,
      name: file.name,
      preview: /\.pdf$/i.test(file.name) ? uploaded : ""
    };
    save(); render();
    $("#resumeStatus").textContent = "Resume uploaded: " + file.name;
    e.target.value = "";
  });

  function renderLists() {
    const mk = (arr, key) => arr.length
      ? arr.map((x, i) => `<li><span>${esc(x.title)}</span><button type="button" data-del="${key}" data-i="${i}">Delete</button></li>`).join("")
      : '<li class="muted">Nothing added yet.</li>';
    $("#projectList").innerHTML = mk(data.projects || [], "projects");
    $("#certList").innerHTML = mk(data.certificates || [], "certificates");
  }

  dlg.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-del]");
    if (!b) return;
    data[b.dataset.del].splice(Number(b.dataset.i), 1);
    save(); render();
  });

  $("#exportData").addEventListener("click", () => {
    const text = "window.PORTFOLIO_DATA = " + JSON.stringify(data, null, 2) + ";\n";
    const url = URL.createObjectURL(new Blob([text], { type: "text/javascript" }));
    const a = document.createElement("a");
    a.href = url; a.download = "data.js"; a.click();
    URL.revokeObjectURL(url);
  });

  $("#resetData").addEventListener("click", () => {
    if (!confirm("Discard changes saved in this browser and reload content from data.js?")) return;
    localStorage.removeItem(STORAGE_KEY);
    data = JSON.parse(JSON.stringify(base));
    render(); fillProfileForm();
  });

  render();
})();
