/* =========================================
   CHRIF — APP.JS (Frontend integrato con REST API + MongoDB Atlas)
   - Sostituisce lo store locale con chiamate REST
   - Supporto JWT via localStorage (usa setToken('<JWT>'))
   - Gestisce id come stringhe (ObjectId) invece che numeri
   ========================================= */

/* ======== API CLIENT ======== */
const API_URL = 'http://localhost:5000/api'; // es. "http://localhost:4000" oppure "" se stesso dominio/NGINX proxy

const API = {
  async get(path) {
    const res = await fetch(API_BASE + path, { headers: authHeaders() });
    if (!res.ok) throw new Error(await safeText(res));
    return res.json();
  },
  async post(path, body) {
    const res = await fetch(API_BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await safeText(res));
    return res.json();
  },
  async put(path, body) {
    const res = await fetch(API_BASE + path, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await safeText(res));
    return res.json();
  },
  async del(path) {
    const res = await fetch(API_BASE + path, { method: "DELETE", headers: authHeaders() });
    if (!res.ok && res.status !== 204) throw new Error(await safeText(res));
    return true;
  },
  async upload(path, file) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(API_BASE + path, { method: "POST", headers: authHeaders(false), body: fd });
    if (!res.ok) throw new Error(await safeText(res));
    return res.json();
  },
};

function authHeaders(includeJSON = true) {
  const token = localStorage.getItem("jwt");
  const h = {};
  if (token) h["Authorization"] = `Bearer ${token}`;
  if (includeJSON) h["Accept"] = "application/json";
  return h;
}

async function safeText(res) { try { return await res.text(); } catch { return "Request failed"; } }

// Utility per impostare/rimuovere JWT
window.setToken = function setToken(t) {
  if (!t) {
    localStorage.removeItem("jwt");
    showNotification("Logged out", "info");
    return;
  }
  localStorage.setItem("jwt", t);
  showNotification("JWT salvato! Le azioni admin useranno il token.", "success");
};

/* ======== STATO ======== */
let appData = {
  siteInfo: { name: "CHRIF", tagline: "Digital Creator & Tech Visionary", email: "", bio: "" },
  skills: [],
  projects: [],
  socialLinks: [],
};

let currentPage = "home";
let currentRoute = "/";
let splashScreenShown = false;

let currentEditingProject = null;
let projectTechnologies = [];
let projectGallery = [];
let projectMainImage = null;

/* ======== BRANDING ======== */
function updateSiteBranding() {
  const navLogo = document.querySelector(".nav-logo");
  if (navLogo) navLogo.textContent = "CHRIF";
  document.title = "CHRIF - Digital Creator & Tech Visionary";
}

/* ======== SPLASH ======== */
function initSplashScreen() {
  const splashScreen = document.getElementById("splashScreen");
  const body = document.body;
  if (!splashScreen) return;

  if (splashScreenShown) {
    splashScreen.style.display = "none";
    body.classList.add("splash-loaded");
    return;
  }
  splashScreenShown = true;
  body.classList.add("splash-active");

  const SPLASH_DURATION = 2000;
  let splashDismissed = false;
  function dismissSplash() {
    if (splashDismissed) return;
    splashDismissed = true;
    splashScreen.style.pointerEvents = "none";
    splashScreen.classList.add("fade-out");
    body.classList.remove("splash-active");
    body.classList.add("splash-loaded");
    setTimeout(() => splashScreen?.parentNode?.removeChild(splashScreen), 600);
  }
  setTimeout(dismissSplash, SPLASH_DURATION);
  splashScreen.addEventListener("click", dismissSplash);
  const keyHandler = () => { dismissSplash(); document.removeEventListener("keydown", keyHandler); };
  document.addEventListener("keydown", keyHandler);
}

/* ======== BOOT ======== */
document.addEventListener("DOMContentLoaded", async function () {
  initSplashScreen();
  initNavigation();
  initProgressBars();
  initButtons();
  initToggles();
  initTerminal();
  initAdminPanel();
  initContactForm();
  initRouter();
  initProjectEditor();

  updateSiteBranding();

  try {
    await loadInitialData(); // prende i dati dal backend
  } catch (e) {
    console.error(e);
    showNotification("Impossibile caricare i dati dal server", "error");
  }

  renderAboutPage();
  renderProjectsPage();
  renderContactPage();
  updateDashboardStats();
  handleRoute();
});

/* ======== CARICAMENTO DATI ======== */
async function loadInitialData() {
  // Endpoint consigliato dal backend per esportare l'intero stato pubblicabile
  const { site, skills, projects, social } = await API.get("/api/export");
  appData.siteInfo = site || appData.siteInfo;
  appData.skills = skills || [];
  appData.projects = projects || [];
  appData.socialLinks = social || [];
}

/* ======== ROUTER ======== */
function initRouter() { window.addEventListener("hashchange", handleRoute); }

function handleRoute() {
  const hash = window.location.hash || "#/";
  currentRoute = hash;
  if (hash === "#/" || hash === "#/home") navigateToPage("home");
  else if (hash === "#/about") navigateToPage("about");
  else if (hash === "#/projects") navigateToPage("projects");
  else if (hash === "#/contact") navigateToPage("contact");
  else if (hash.startsWith("#/project/")) {
    const id = hash.split("/")[2]; // ID string (ObjectId), non parseInt
    showProjectDetail(id);
  } else navigateToPage("home");
}

function navigateToRoute(route) { window.location.hash = route; }
window.navigateToRoute = navigateToRoute;

/* ======== NAV ======== */
function initNavigation() {
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = link.getAttribute("data-page");
      navigateToRoute(page === "home" ? "/" : "/" + page);
    });
  });
}

function navigateToPage(page) {
  document.getElementById("page-project-detail")?.remove();
  document.querySelectorAll(".page").forEach((p) => p.classList.add("hidden"));
  const target = document.getElementById(`page-${page}`);
  if (target) { target.classList.remove("hidden"); currentPage = page; }
  document.querySelectorAll(".nav-link").forEach((l) => {
    l.classList.toggle("active", l.getAttribute("data-page") === page);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ======== PROGETTI: DETTAGLIO ======== */
function showProjectDetail(projectId) {
  const project = appData.projects.find((p) => String(p._id) === String(projectId));
  if (!project) { navigateToRoute("/projects"); return; }

  document.querySelectorAll(".page").forEach((p) => p.classList.add("hidden"));
  document.getElementById("page-project-detail")?.remove();

  const detailPage = createProjectDetailPage(project);
  document.getElementById("appContainer").appendChild(detailPage);

  document.querySelectorAll(".nav-link").forEach((link) => link.classList.remove("active"));
  currentPage = "project-detail";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function createProjectDetailPage(project) {
  const page = document.createElement("div");
  page.className = "page project-detail-page";
  page.id = "page-project-detail";

  const relatedProjects = appData.projects
    .filter((p) => String(p._id) !== String(project._id))
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  page.innerHTML = `
    <div class="project-detail-container">
      <div class="breadcrumb">
        <a href="#/projects" class="breadcrumb-link">← BACK TO PROJECTS</a>
      </div>
      <div class="project-detail-hero">
        <div class="project-detail-icon">${project.image || "⚡"}</div>
        <h1 class="project-detail-title glitch" data-text="${project.title}">${project.title}</h1>
      </div>
      <div class="project-detail-content">
        <div class="project-detail-main">
          <div class="project-detail-image">
            <div class="project-visual">
              <div class="project-visual-icon">${project.image || "⚡"}</div>
              <div class="visual-effects">
                <div class="effect-line"></div><div class="effect-line"></div><div class="effect-line"></div>
              </div>
            </div>
          </div>
          <div class="project-detail-section">
            <h2 class="section-heading" data-color="cyan">ABOUT THIS PROJECT</h2>
            <p class="project-detail-description">${project.full_description || ""}</p>
          </div>
          <div class="project-detail-section">
            <h2 class="section-heading" data-color="magenta">TECHNOLOGIES USED</h2>
            <div class="project-tech-tags">
              ${(project.technologies || []).map((t,i)=>`<span class="tech-tag" style="animation-delay:${i*0.1}s">${t}</span>`).join("")}
            </div>
          </div>
          ${project.link && project.link !== "#" ? `
          <div class="project-detail-section">
            <a href="${project.link}" target="_blank" class="project-detail-button">
              <span>VIEW LIVE PROJECT</span><span class="button-arrow">→</span>
            </a>
          </div>` : ""}
        </div>
        ${relatedProjects.length ? `
          <div class="related-projects-section">
            <h2 class="section-heading" data-color="purple">RELATED PROJECTS</h2>
            <div class="related-projects-grid">
              ${relatedProjects.map(rp => `
                <div class="related-project-card" onclick="navigateToRoute('/project/${rp._id}')">
                  <div class="related-project-icon">${rp.image || "◆"}</div>
                  <h3 class="related-project-title">${rp.title}</h3>
                  <p class="related-project-desc">${rp.brief_description || ""}</p>
                </div>`).join("")}
            </div>
          </div>` : ""}
      </div>
    </div>`;
  return page;
}

/* ======== ORNAMENTI UI ======== */
function initProgressBars() {
  setTimeout(() => {
    document.querySelectorAll(".progress-fill").forEach((fill) => {
      const percent = fill.getAttribute("data-percent");
      fill.style.width = percent + "%";
    });
  }, 500);
}

function initButtons() {
  document.querySelectorAll(".cyber-button").forEach((button) => {
    button.addEventListener("click", function () {
      this.classList.add("pulse");
      const ripple = document.createElement("div");
      Object.assign(ripple.style, {
        position: "absolute",
        width: "100%", height: "100%", top: "0", left: "0",
        background: "rgba(255,255,255,0.3)", borderRadius: "5px",
        animation: "ripple 0.6s ease-out", pointerEvents: "none",
      });
      this.appendChild(ripple);
      setTimeout(() => { this.classList.remove("pulse"); ripple.remove(); }, 600);
    });
  });
}

function initToggles() {
  document.querySelectorAll(".switch").forEach((sw) => {
    sw.addEventListener("click", function () {
      this.setAttribute("data-state", this.getAttribute("data-state") === "on" ? "off" : "on");
    });
  });
}

function initTerminal() {
  const terminalOutput = document.getElementById("terminal-output");
  if (!terminalOutput) return;
  const lines = [
    "> Initializing cyber connection...",
    "> Loading neon protocols...",
    "> System status: ONLINE",
    "> Welcome to the future",
  ];
  let i = 0;
  function typeLine() {
    if (i < lines.length) {
      const line = document.createElement("div");
      line.className = "terminal-line";
      line.textContent = lines[i++];
      terminalOutput.appendChild(line);
      setTimeout(typeLine, 1000);
    }
  }
  setTimeout(typeLine, 500);
}

/* ======== EDITOR PROGETTI ======== */
function initProjectEditor() {
  const taglineInput = document.getElementById("projectTagline");
  if (taglineInput) {
    taglineInput.addEventListener("input", function () {
      const tc = document.getElementById("taglineCount");
      if (tc) tc.textContent = this.value.length + "/100";
      updatePreview();
    });
  }

  const mainImagePlaceholder = document.getElementById("mainImagePlaceholder");
  const mainImageFile = document.getElementById("mainImageFile");
  const mainImageUrl = document.getElementById("mainImageUrl");

  if (mainImagePlaceholder) {
    mainImagePlaceholder.addEventListener("click", () => mainImageFile?.click());
    mainImagePlaceholder.addEventListener("dragover", (e) => { e.preventDefault(); mainImagePlaceholder.style.borderColor = "#ff00ff"; });
    mainImagePlaceholder.addEventListener("dragleave", () => { mainImagePlaceholder.style.borderColor = "#00ffff"; });
    mainImagePlaceholder.addEventListener("drop", async (e) => {
      e.preventDefault(); mainImagePlaceholder.style.borderColor = "#00ffff";
      if (e.dataTransfer.files.length > 0) await handleMainImageFile(e.dataTransfer.files[0]);
    });
    mainImagePlaceholder.addEventListener("paste", (e) => {
      const items = e.clipboardData.items;
      for (let item of items) if (item.type.indexOf("image") !== -1) handleMainImageFile(item.getAsFile());
    });
  }

  if (mainImageFile) {
    mainImageFile.addEventListener("change", async (e) => {
      if (e.target.files.length > 0) await handleMainImageFile(e.target.files[0]);
    });
  }

  if (mainImageUrl) {
    mainImageUrl.addEventListener("blur", function () {
      if (this.value) { projectMainImage = this.value; showMainImagePreview(this.value); }
    });
  }

  const techInput = document.getElementById("technologiesInput");
  if (techInput) {
    techInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const value = techInput.value.trim();
        if (value && !projectTechnologies.includes(value)) {
          projectTechnologies.push(value);
          renderTechnologiesTags();
          updatePreview();
          techInput.value = "";
        }
      }
    });
  }

  ["projectTitle", "projectImage", "projectTagline"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", updatePreview);
  });

  const editorForm = document.getElementById("projectEditorForm");
  if (editorForm) editorForm.addEventListener("submit", saveProject);
}

async function handleMainImageFile(file) {
  if (!file.type.match("image.*")) { showNotification("Please select an image file", "error"); return; }
  try {
    if (localStorage.getItem("jwt")) {
      const { url } = await API.upload("/api/uploads", file);
      projectMainImage = url;
      showMainImagePreview(url);
      return;
    }
  } catch (e) {
    console.warn("Upload fallito, uso dataURL locale:", e);
  }
  const reader = new FileReader();
  reader.onload = (e) => { projectMainImage = e.target.result; showMainImagePreview(e.target.result); };
  reader.readAsDataURL(file);
}

function showMainImagePreview(src) {
  document.getElementById("mainImagePlaceholder")?.classList.add("hidden");
  document.getElementById("mainImagePreview")?.classList.remove("hidden");
  const img = document.getElementById("mainImageDisplay");
  if (img) img.src = src;
}

window.removeMainImage = function () {
  projectMainImage = null;
  document.getElementById("mainImagePlaceholder")?.classList.remove("hidden");
  document.getElementById("mainImagePreview")?.classList.add("hidden");
  const url = document.getElementById("mainImageUrl");
  if (url) url.value = "";
};

window.addGalleryImage = function () {
  const url = prompt("Enter image URL or leave blank to upload:");
  if (url) {
    projectGallery.push({ url, caption: "" });
    renderGalleryImages();
  } else {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        if (localStorage.getItem("jwt")) {
          const { url } = await API.upload("/api/uploads", file);
          projectGallery.push({ url, caption: "" });
        } else {
          const reader = new FileReader();
          reader.onload = (ev) => projectGallery.push({ url: ev.target.result, caption: "" });
          reader.readAsDataURL(file);
        }
      } finally { renderGalleryImages(); }
    };
    input.click();
  }
};

function renderGalleryImages() {
  const container = document.getElementById("galleryImages");
  if (!container) return;
  container.innerHTML = "";
  projectGallery.forEach((img, index) => {
    const item = document.createElement("div");
    item.className = "gallery-item";
    item.draggable = true;
    item.innerHTML = `
      <img src="${img.url}" alt="Gallery image ${index + 1}">
      <div class="gallery-item-actions">
        <button type="button" class="gallery-item-btn delete" onclick="removeGalleryImage(${index})">✕</button>
      </div>
      <div class="gallery-item-caption">
        <input type="text" placeholder="Caption..." value="${img.caption}"
          onchange="updateGalleryCaption(${index}, this.value)"
          style="background:transparent;border:none;color:#fff;width:100%;font-size:.75rem;">
      </div>`;
    container.appendChild(item);
  });
}
window.removeGalleryImage = function (i) { projectGallery.splice(i, 1); renderGalleryImages(); };
window.updateGalleryCaption = function (i, caption) { projectGallery[i].caption = caption; };

function renderTechnologiesTags() {
  const container = document.getElementById("technologiesTags");
  if (!container) return;
  container.innerHTML = "";
  projectTechnologies.forEach((tech, idx) => {
    const tag = document.createElement("div");
    tag.className = "tag-item";
    tag.innerHTML = `<span>${tech}</span><span class="tag-remove" onclick="removeTechnology(${idx})">✕</span>`;
    container.appendChild(tag);
  });
}
window.removeTechnology = function (i) { projectTechnologies.splice(i, 1); renderTechnologiesTags(); updatePreview(); };

function updatePreview() {
  const title = document.getElementById("projectTitle")?.value || "Project Title";
  const icon = document.getElementById("projectImage")?.value || "⚡";
  const tagline = document.getElementById("projectTagline")?.value || "Brief description will appear here";
  const pi = document.getElementById("previewIcon");
  const pt = document.getElementById("previewTitle");
  const pg = document.getElementById("previewTagline");
  if (pi) pi.textContent = icon;
  if (pt) pt.textContent = title;
  if (pg) pg.textContent = tagline;
  const tagsContainer = document.getElementById("previewTags");
  if (tagsContainer) {
    tagsContainer.innerHTML = "";
    projectTechnologies.slice(0, 3).forEach((t) => {
      const tag = document.createElement("span");
      tag.className = "preview-tag";
      tag.textContent = t;
      tagsContainer.appendChild(tag);
    });
  }
}

window.showNewProjectEditor = function () {
  currentEditingProject = null;
  projectTechnologies = [];
  projectGallery = [];
  projectMainImage = null;

  document.querySelectorAll(".admin-tab").forEach((t) => t.classList.remove("active"));
  document.getElementById("editorTab")?.classList.add("active");
  const editorTab = document.getElementById("editorTab");
  if (editorTab) editorTab.style.display = "block";

  document.querySelectorAll(".admin-tab-content").forEach((c) => c.classList.remove("active"));
  document.getElementById("tab-editor")?.classList.add("active");

  document.getElementById("projectEditorForm")?.reset();
  const ep = document.getElementById("editingProjectId");
  if (ep) ep.value = "";
  const et = document.getElementById("editorTitle");
  if (et) et.textContent = "NEW PROJECT";
  const tc = document.getElementById("taglineCount");
  if (tc) tc.textContent = "0/100";
  removeMainImage(); renderGalleryImages(); renderTechnologiesTags(); updatePreview();
};

window.editProject = function (id) {
  const project = appData.projects.find((p) => String(p._id) === String(id));
  if (!project) return;

  currentEditingProject = project;
  projectTechnologies = [...(project.technologies || [])];
  projectGallery = [...(project.galleryImages || [])];
  projectMainImage = project.mainImage || null;

  document.querySelectorAll(".admin-tab").forEach((t) => t.classList.remove("active"));
  document.getElementById("editorTab")?.classList.add("active");
  const editorTab = document.getElementById("editorTab");
  if (editorTab) editorTab.style.display = "block";

  document.querySelectorAll(".admin-tab-content").forEach((c) => c.classList.remove("active"));
  document.getElementById("tab-editor")?.classList.add("active");

  const setVal = (id, val, fallback = "") => { const el = document.getElementById(id); if (el) el.value = val ?? fallback; };
  const setCheck = (id, val) => { const el = document.getElementById(id); if (el) el.checked = !!val; };

  const ep = document.getElementById("editingProjectId"); if (ep) ep.value = project._id;
  const et = document.getElementById("editorTitle"); if (et) et.textContent = "EDIT PROJECT: " + (project.title || "").toUpperCase();

  setVal("projectTitle", project.title);
  setVal("projectImage", project.image, "⚡");
  setVal("projectCategory", project.category, "Web App");
  setVal("projectStatus", project.status, "Completed");
  setVal("projectTagline", project.tagline || project.brief_description);
  setVal("projectFullDescription", project.full_description);
  setVal("projectTools", project.tools);
  setVal("projectLiveUrl", project.live_url);
  setVal("projectGithubUrl", project.github_url);
  setVal("projectDemoUrl", project.demo_url);
  setVal("projectClient", project.client_name);
  setVal("projectRole", project.role);
  setVal("projectTeamSize", project.team_size);
  setVal("projectDuration", project.duration);
  setVal("projectChallenges", project.challenges);
  setVal("projectSolutions", project.solutions);
  setVal("projectResults", project.results);
  setVal("projectVideoUrl", project.video_url);
  setCheck("projectFeatured", project.featured);
  setCheck("projectVisible", project.visible !== false);

  const tl = document.getElementById("taglineCount");
  if (tl) tl.textContent = (project.tagline || project.brief_description || "").length + "/100";

  if (projectMainImage) showMainImagePreview(projectMainImage); else removeMainImage();
  renderGalleryImages(); renderTechnologiesTags(); updatePreview();
};

async function saveProject(e) {
  e.preventDefault();
  const form = e.target;
  const editingId = document.getElementById("editingProjectId")?.value;

  const v = (name) => form[name]?.value || "";
  const projectData = {
    title: v("title"),
    tagline: v("tagline"),
    brief_description: v("tagline"),
    full_description: v("full_description"),
    category: v("category"),
    status: v("status"),
    image: v("image") || "⚡",
    technologies: [...projectTechnologies],
    tools: v("tools"),
    live_url: v("live_url"),
    github_url: v("github_url"),
    demo_url: v("demo_url"),
    link: v("live_url") || "#",
    client_name: v("client_name"),
    role: v("role"),
    team_size: v("team_size"),
    duration: v("duration"),
    challenges: v("challenges"),
    solutions: v("solutions"),
    results: v("results"),
    video_url: v("video_url"),
    mainImage: projectMainImage,
    galleryImages: [...projectGallery],
    featured: !!form.featured?.checked,
    visible: !!form.visible?.checked,
  };

  try {
    if (editingId) {
      const updated = await API.put(`/api/projects/${editingId}`, projectData);
      const idx = appData.projects.findIndex((p) => String(p._id) === String(editingId));
      if (idx !== -1) appData.projects[idx] = updated;
      showNotification(`Project "${updated.title}" updated successfully!`, "success");
    } else {
      const created = await API.post("/api/projects", projectData);
      appData.projects.unshift(created);
      showNotification(`Project "${created.title}" created successfully!`, "success");
    }
    renderProjectsPage(); renderAdminProjects(); updateDashboardStats();

    setTimeout(() => {
      const pid = editingId || appData.projects[0]._id;
      if (confirm(`Would you like to view "${projectData.title}" page now?`)) {
        document.getElementById("adminPanel")?.classList.add("hidden");
        navigateToRoute("/project/" + pid);
      } else {
        cancelEditor();
      }
    }, 500);
  } catch (err) {
    console.error(err);
    showNotification("Azione non autorizzata o errore server. Assicurati di avere un JWT valido.", "error");
  }
}

window.cancelEditor = function () {
  document.querySelectorAll(".admin-tab").forEach((t) => t.classList.remove("active"));
  const tabBtn = document.querySelector('.admin-tab[data-tab="projects"]');
  if (tabBtn) tabBtn.classList.add("active");
  const editorTab = document.getElementById("editorTab");
  if (editorTab) editorTab.style.display = "none";
  document.querySelectorAll(".admin-tab-content").forEach((c) => c.classList.remove("active"));
  document.getElementById("tab-projects")?.classList.add("active");
};

window.previewProject = function () {
  const title = document.getElementById("projectTitle")?.value || "Untitled Project";
  alert(`Preview functionality\n\nProject: ${title}\nTechnologies: ${projectTechnologies.join(", ")}`);
};

window.exportPortfolioData = async function () {
  try {
    const data = await API.get("/api/export");
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "portfolio-data.json"; a.click();
    URL.revokeObjectURL(url);
    showNotification("Portfolio data exported!", "success");
  } catch (e) {
    showNotification("Export failed", "error");
  }
};

/* ======== DASHBOARD ======== */
function updateDashboardStats() {
  const t = document.getElementById("totalProjects");
  const f = document.getElementById("featuredProjects");
  const c = document.getElementById("completedProjects");
  if (t) t.textContent = appData.projects.length;
  if (f) f.textContent = appData.projects.filter((p) => p.featured).length;
  if (c) c.textContent = appData.projects.filter((p) => (p.status || "").toLowerCase() === "completed").length;
}

/* ======== ADMIN PANEL ======== */
function initAdminPanel() {
  const adminToggle = document.getElementById("adminToggle");
  const adminPanel = document.getElementById("adminPanel");
  const adminClose = document.getElementById("adminClose");
  const adminTabs = document.querySelectorAll(".admin-tab");

  if (adminToggle) {
    adminToggle.addEventListener("click", () => {
      adminPanel?.classList.remove("hidden");
      renderAdminProjects(); renderAdminSkills(); renderAdminSocial();
      const bioInput = document.getElementById("bioInput");
      const emailInput = document.getElementById("emailInput");
      if (bioInput) bioInput.value = appData.siteInfo.bio || "";
      if (emailInput) emailInput.value = appData.siteInfo.email || "";
    });
  }
  if (adminClose) adminClose.addEventListener("click", () => adminPanel?.classList.add("hidden"));

  adminTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabName = tab.getAttribute("data-tab");
      adminTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      document.querySelectorAll(".admin-tab-content").forEach((c) => c.classList.remove("active"));
      document.getElementById(`tab-${tabName}`)?.classList.add("active");
    });
  });

  const searchInput = document.getElementById("projectSearch");
  const filterCategory = document.getElementById("filterCategory");
  const filterStatus = document.getElementById("filterStatus");
  if (searchInput) searchInput.addEventListener("input", renderAdminProjects);
  if (filterCategory) filterCategory.addEventListener("change", renderAdminProjects);
  if (filterStatus) filterStatus.addEventListener("change", renderAdminProjects);

  // Edit Bio
  const editBioForm = document.getElementById("editBioForm");
  if (editBioForm) {
    editBioForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const bio = new FormData(e.target).get("bio");
      try {
        const updated = await API.put("/api/site", { bio });
        appData.siteInfo = updated; renderAboutPage();
        showNotification("Bio updated successfully!", "success");
      } catch {
        showNotification("Update failed (JWT?)", "error");
      }
    });
  }

  // Add Skill
  const addSkillForm = document.getElementById("addSkillForm");
  if (addSkillForm) {
    addSkillForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const newSkill = { name: fd.get("skillName"), level: parseInt(fd.get("skillLevel")) };
      try {
        const created = await API.post("/api/skills", newSkill);
        appData.skills.unshift(created);
        renderAboutPage(); renderAdminSkills(); e.target.reset();
        showNotification("Skill added successfully!", "success");
      } catch {
        showNotification("Add skill failed (JWT?)", "error");
      }
    });
  }

  // Edit Contact (email)
  const editContactForm = document.getElementById("editContactForm");
  if (editContactForm) {
    editContactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = new FormData(e.target).get("email");
      try {
        const updated = await API.put("/api/site", { email });
        appData.siteInfo = updated; renderContactPage();
        showNotification("Contact info updated successfully!", "success");
      } catch {
        showNotification("Update failed (JWT?)", "error");
      }
    });
  }

  // Add Social Link
  const addSocialForm = document.getElementById("addSocialForm");
  if (addSocialForm) {
    addSocialForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const newLink = { platform: fd.get("platform"), url: fd.get("url"), icon: fd.get("icon") };
      try {
        const created = await API.post("/api/social-links", newLink);
        appData.socialLinks.unshift(created);
        renderContactPage(); renderAdminSocial(); e.target.reset();
        showNotification("Social link added successfully!", "success");
      } catch {
        showNotification("Add social failed (JWT?)", "error");
      }
    });
  }
}

function renderAdminProjects() {
  const list = document.getElementById("adminProjectsList");
  if (!list) return;

  const searchTerm = document.getElementById("projectSearch")?.value.toLowerCase() || "";
  const categoryFilter = document.getElementById("filterCategory")?.value || "";
  const statusFilter = document.getElementById("filterStatus")?.value || "";

  let filtered = appData.projects.filter((project) => {
    const matchesSearch =
      !searchTerm ||
      project.title.toLowerCase().includes(searchTerm) ||
      (project.brief_description && project.brief_description.toLowerCase().includes(searchTerm));
    const matchesCategory = !categoryFilter || project.category === categoryFilter;
    const matchesStatus = !statusFilter || project.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  list.innerHTML = "";
  if (!filtered.length) {
    list.innerHTML = '<p style="color: rgba(255,255,255,0.7); text-align: center; padding: 2rem;">No projects found</p>';
    return;
  }

  filtered.forEach((project) => {
    const statusClass = `status-${(project.status || "completed").toLowerCase().replace(" ", "")}`;
    const item = document.createElement("div");
    item.className = "admin-item";
    item.innerHTML = `
      <div class="admin-item-content">
        <div class="admin-item-title">
          ${project.image || "◆"} ${project.title}
          <span class="project-status-badge ${statusClass}">${project.status || "Completed"}</span>
          ${project.featured ? '<span class="project-status-badge" style="background: rgba(255, 215, 0, 0.2); color: gold; border-color: gold;">⭐ Featured</span>' : ""}
        </div>
        <div class="admin-item-text">${project.tagline || project.brief_description || ""}</div>
        <div class="admin-item-text" style="font-size: .75rem; margin-top: .5rem;">
          ${project.category || "Uncategorized"} | ${(project.technologies || []).slice(0, 3).join(", ") || "No tech listed"}
        </div>
      </div>
      <div class="admin-item-actions">
        <button class="admin-btn view" onclick="editProject('${project._id}')" style="border-color: #9d00ff; color: #9d00ff;">✏️ EDIT</button>
        <button class="admin-btn view" onclick="viewProjectPage('${project._id}')">👁️ VIEW</button>
        <button class="admin-btn delete" onclick="deleteProject('${project._id}')">✕ DELETE</button>
      </div>`;
    list.appendChild(item);
  });
}

window.viewProjectPage = function (id) {
  document.getElementById("adminPanel")?.classList.add("hidden");
  navigateToRoute("/project/" + id);
};

/* Skills */
function renderAdminSkills() {
  const list = document.getElementById("adminSkillsList");
  if (!list) return;
  list.innerHTML = "";
  appData.skills.forEach((skill) => {
    const item = document.createElement("div");
    item.className = "admin-item";
    item.innerHTML = `
      <div class="admin-item-content">
        <div class="admin-item-title">${skill.name}</div>
        <div class="admin-item-text">Level: ${skill.level}%</div>
      </div>
      <div class="admin-item-actions">
        <button class="admin-btn delete" onclick="deleteSkill('${skill._id || ""}')">✕ DELETE</button>
      </div>`;
    list.appendChild(item);
  });
}

/* Social */
function renderAdminSocial() {
  const list = document.getElementById("adminSocialList");
  if (!list) return;
  list.innerHTML = "";
  appData.socialLinks.forEach((link) => {
    const item = document.createElement("div");
    item.className = "admin-item";
    item.innerHTML = `
      <div class="admin-item-content">
        <div class="admin-item-title">${link.icon || "🔗"} ${link.platform}</div>
        <div class="admin-item-text">${link.url}</div>
      </div>
      <div class="admin-item-actions">
        <button class="admin-btn delete" onclick="deleteSocial('${link._id || ""}')">✕ DELETE</button>
      </div>`;
    list.appendChild(item);
  });
}

// DELETE via API
window.deleteProject = async function (id) {
  const project = appData.projects.find((p) => String(p._id) === String(id));
  if (project && confirm(`Are you sure you want to delete "${project.title}"? This cannot be undone.`)) {
    try {
      await API.del(`/api/projects/${id}`);
      appData.projects = appData.projects.filter((p) => String(p._id) !== String(id));
      renderProjectsPage(); renderAdminProjects(); updateDashboardStats();
      showNotification("Project deleted", "success");
    } catch {
      showNotification("Delete failed (JWT?)", "error");
    }
  }
};

window.deleteSkill = async function (id) {
  if (!id) { showNotification("ID not found", "error"); return; }
  if (confirm("Are you sure you want to delete this skill?")) {
    try {
      await API.del(`/api/skills/${id}`);
      appData.skills = appData.skills.filter((s) => String(s._id) !== String(id));
      renderAboutPage(); renderAdminSkills();
      showNotification("Skill deleted", "success");
    } catch {
      showNotification("Delete failed (JWT?)", "error");
    }
  }
};

window.deleteSocial = async function (id) {
  if (!id) { showNotification("ID not found", "error"); return; }
  if (confirm("Are you sure you want to delete this social link?")) {
    try {
      await API.del(`/api/social-links/${id}`);
      appData.socialLinks = appData.socialLinks.filter((s) => String(s._id) !== String(id));
      renderContactPage(); renderAdminSocial();
      showNotification("Social link deleted", "success");
    } catch {
      showNotification("Delete failed (JWT?)", "error");
    }
  }
};

/* ======== RENDER PAGINE ======== */
function renderAboutPage() {
  const bioText = document.getElementById("bioText");
  if (bioText) bioText.textContent = appData.siteInfo.bio || "";

  const skillsGrid = document.getElementById("skillsGrid");
  if (!skillsGrid) return;
  skillsGrid.innerHTML = "";
  appData.skills.forEach((skill) => {
    const skillItem = document.createElement("div");
    skillItem.className = "skill-item";
    skillItem.innerHTML = `
      <div class="skill-name">${skill.name}</div>
      <div class="skill-bar">
        <div class="skill-fill" style="width: ${skill.level}%"></div>
        <div class="skill-level">${skill.level}%</div>
      </div>`;
    skillsGrid.appendChild(skillItem);
  });
}

function renderProjectsPage() {
  const grid = document.getElementById("projectsGrid");
  if (!grid) return;
  grid.innerHTML = "";

  if (!appData.projects.length) {
    grid.innerHTML = '<p style="color: rgba(255,255,255,0.7); text-align: center; grid-column: 1/-1;">No projects yet. Add some from the admin panel!</p>';
    return;
  }

  appData.projects.forEach((project) => {
    const card = document.createElement("div");
    card.className = "project-card"; card.style.cursor = "pointer";
    card.innerHTML = `
      <div class="project-icon">${project.image || "⚙️"}</div>
      <h3 class="project-title">${project.title}</h3>
      <p class="project-description">${project.brief_description || ""}</p>
      <div class="project-tags">
        ${(project.technologies || []).map((t) => `<span class="project-tag">${t}</span>`).join("")}
      </div>
      <button class="project-link view-project-btn">VIEW PROJECT</button>`;
    card.addEventListener("click", () => navigateToRoute("/project/" + project._id));
    grid.appendChild(card);
  });
}

function renderContactPage() {
  const emailSpan = document.getElementById("contactEmail");
  if (emailSpan) emailSpan.textContent = appData.siteInfo.email || "";
  const socialList = document.getElementById("socialLinksList");
  if (!socialList) return;
  socialList.innerHTML = "";
  appData.socialLinks.forEach((link) => {
    const a = document.createElement("a");
    a.className = "social-link-item"; a.href = link.url; a.target = "_blank";
    a.innerHTML = `<span class="social-link-icon">${link.icon || "🔗"}</span><span class="social-link-text">${link.platform}</span>`;
    socialList.appendChild(a);
  });
}

/* ======== CONTACT FORM → API ======== */
function initContactForm() {
  const form = document.getElementById("contactForm");
  const message = document.getElementById("formMessage");
  if (!form || !message) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = { name: fd.get("name"), email: fd.get("email"), message: fd.get("message") };
    try {
      await API.post("/api/contact", payload);
      message.classList.remove("hidden", "error"); message.classList.add("success");
      message.textContent = "✓ Message sent successfully! I'll get back to you soon.";
      form.reset();
      setTimeout(() => message.classList.add("hidden"), 5000);
    } catch (err) {
      message.classList.remove("hidden", "success"); message.classList.add("error");
      message.textContent = "✕ Sending failed. Please try again.";
    }
  });
}

/* ======== NOTIFICHE + CSS ======== */
function showNotification(message, type = "info") {
  const n = document.getElementById("notification");
  if (!n) return;
  n.textContent = message;
  n.className = `notification ${type}`;
  n.classList.remove("hidden");
  setTimeout(() => n.classList.add("hidden"), 3000);
}
const style = document.createElement("style");
style.textContent = `
  @keyframes ripple { 0%{opacity:1;transform:scale(0);} 100%{opacity:0;transform:scale(2);} }
`;
document.head.appendChild(style);
