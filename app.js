const STORAGE_KEY = "hopeAuraStateV1";
const TRACKING_STEPS = ["Received", "Verified", "Assigned", "On the Way", "Delivered"];

const reliefProducts = [
  {
    id: "food",
    name: "Family Food Pack",
    icon: "🍚",
    price: 850,
    description: "Rice, lentils, salt, oil, dry food, and baby-friendly essentials for a small family."
  },
  {
    id: "water",
    name: "Safe Water Pack",
    icon: "💧",
    price: 420,
    description: "Drinking water, purification tablets, oral saline, and water storage support."
  },
  {
    id: "medicine",
    name: "Emergency Medicine Kit",
    icon: "💊",
    price: 650,
    description: "First-aid items, fever support, bandage, antiseptic, and basic emergency care."
  },
  {
    id: "hygiene",
    name: "Hygiene & Safety Kit",
    icon: "🧼",
    price: 520,
    description: "Soap, sanitary items, masks, hand sanitizer, and child hygiene essentials."
  },
  {
    id: "shelter",
    name: "Temporary Shelter Kit",
    icon: "🏠",
    price: 1200,
    description: "Tarpaulin, blanket, rope, torch, matches, and dry sleeping support."
  },
  {
    id: "rescue",
    name: "Rescue Support Pack",
    icon: "🚑",
    price: 1500,
    description: "Priority rescue coordination with volunteer assignment and emergency transport support."
  }
];

const seedState = {
  requests: [
    {
      id: "HA-1001",
      name: "Rafiq Ahmed",
      phone: "01700000001",
      type: "Food & Water",
      location: "Char Fasson, Bhola",
      priority: "Critical",
      message: "Thirty families need dry food and safe water after river water entered the area.",
      status: "Verified",
      assignedVolunteer: "Ayesha Karim",
      createdAt: "2026-05-19T08:30:00.000Z",
      source: "SOS"
    },
    {
      id: "HA-1002",
      name: "Mst. Farzana",
      phone: "01800000002",
      type: "Medicine",
      location: "Kalapara, Patuakhali",
      priority: "High",
      message: "Elderly people need emergency medicine and oral saline.",
      status: "Assigned",
      assignedVolunteer: "Tanvir Hasan",
      createdAt: "2026-05-19T09:20:00.000Z",
      source: "SOS"
    },
    {
      id: "HA-1003",
      name: "Community Shelter Lead",
      phone: "01900000003",
      type: "Shelter",
      location: "Sariakandi, Bogura",
      priority: "Medium",
      message: "Temporary shelter and hygiene items needed for displaced families.",
      status: "Received",
      assignedVolunteer: "Not assigned",
      createdAt: "2026-05-19T10:00:00.000Z",
      source: "Relief Order"
    }
  ],
  donations: [
    {
      id: "DN-501",
      donor: "Varendra Youth Club",
      contact: "info@example.com",
      type: "Money",
      details: "৳12000",
      amount: 12000,
      area: "Bhola",
      createdAt: "2026-05-18T13:00:00.000Z"
    },
    {
      id: "DN-502",
      donor: "Anonymous Donor",
      contact: "hidden",
      type: "Products",
      details: "100 water bottles",
      amount: 5000,
      area: "Patuakhali",
      createdAt: "2026-05-18T16:15:00.000Z"
    }
  ],
  volunteers: [
    { id: "VL-201", name: "Ayesha Karim", district: "Bhola", skill: "Relief delivery", active: true },
    { id: "VL-202", name: "Tanvir Hasan", district: "Patuakhali", skill: "First aid", active: true },
    { id: "VL-203", name: "Nusrat Jahan", district: "Bogura", skill: "Shelter coordination", active: true }
  ],
  shelters: [
    { id: "SH-01", name: "Char Fasson Cyclone Shelter", district: "Bhola", address: "Near Upazila Complex", capacity: 72, contact: "01711-222333" },
    { id: "SH-02", name: "Kalapara High School Shelter", district: "Patuakhali", address: "School Road, Kalapara", capacity: 58, contact: "01822-444555" },
    { id: "SH-03", name: "Sariakandi Community Center", district: "Bogura", address: "Ward 4, Sariakandi", capacity: 42, contact: "01933-666777" },
    { id: "SH-04", name: "Rajshahi Relief Camp", district: "Rajshahi", address: "Padma River Bank Area", capacity: 64, contact: "01644-888999" }
  ],
  counters: {
    request: 1004,
    donation: 503,
    volunteer: 204
  }
};

let state = loadState();
let basket = [];

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : structuredClone(seedState);
  } catch (error) {
    console.warn("State load failed, using seed data", error);
    return structuredClone(seedState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatCurrency(amount) {
  return `৳${Number(amount || 0).toLocaleString("en-BD")}`;
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function parseAmount(details) {
  const match = String(details).replaceAll(",", "").match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function notify(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function priorityClass(priority) {
  return String(priority).toLowerCase().replaceAll(" ", "-");
}

function currentDateTime() {
  return new Date().toISOString();
}

function nextId(prefix, counterName) {
  const number = state.counters[counterName];
  state.counters[counterName] += 1;
  return `${prefix}-${number}`;
}

function getDonationTotal() {
  return state.donations.reduce((sum, donation) => sum + Number(donation.amount || 0), 0);
}

function getOpenRequests() {
  return state.requests.filter((request) => request.status !== "Delivered");
}

function renderHeroStats() {
  document.getElementById("heroRequests").textContent = getOpenRequests().length;
  document.getElementById("heroVolunteers").textContent = state.volunteers.filter((item) => item.active).length;
  document.getElementById("heroDonations").textContent = formatCurrency(getDonationTotal());
}

function renderReliefProducts() {
  const container = document.getElementById("reliefProducts");
  container.innerHTML = reliefProducts.map((product) => `
    <article class="product-card">
      <div class="product-head">
        <span class="product-icon" aria-hidden="true">${product.icon}</span>
        <span class="price-tag">${formatCurrency(product.price)}</span>
      </div>
      <div>
        <h3>${escapeHTML(product.name)}</h3>
        <p>${escapeHTML(product.description)}</p>
      </div>
      <button class="btn btn-primary" data-add-product="${product.id}">Add to Basket</button>
    </article>
  `).join("");
}

function renderBasket() {
  const items = document.getElementById("basketItems");
  const total = basket.reduce((sum, productId) => {
    const product = reliefProducts.find((item) => item.id === productId);
    return sum + (product ? product.price : 0);
  }, 0);

  document.getElementById("basketTotal").textContent = formatCurrency(total);

  if (!basket.length) {
    items.className = "basket-items empty";
    items.textContent = "No item selected yet.";
    return;
  }

  items.className = "basket-items";
  items.innerHTML = basket.map((productId, index) => {
    const product = reliefProducts.find((item) => item.id === productId);
    return `
      <div class="basket-line">
        <span>${product.icon} ${escapeHTML(product.name)} <strong>${formatCurrency(product.price)}</strong></span>
        <button type="button" aria-label="Remove ${escapeHTML(product.name)}" data-remove-basket="${index}">×</button>
      </div>
    `;
  }).join("");
}

function renderDonationProgress() {
  const targets = [
    { name: "Food & Water", goal: 50000, amount: Math.min(getDonationTotal() * 0.36, 50000) },
    { name: "Medicine", goal: 35000, amount: Math.min(getDonationTotal() * 0.24, 35000) },
    { name: "Shelter & Hygiene", goal: 45000, amount: Math.min(getDonationTotal() * 0.40, 45000) }
  ];

  document.getElementById("progressList").innerHTML = targets.map((target) => {
    const percent = Math.min(100, Math.round((target.amount / target.goal) * 100));
    return `
      <div class="progress-item">
        <div class="progress-meta">
          <span>${target.name}</span>
          <span>${percent}%</span>
        </div>
        <div class="progress-track" aria-label="${target.name} ${percent}% funded">
          <div class="progress-fill" style="width: ${percent}%"></div>
        </div>
      </div>
    `;
  }).join("");

  const recent = [...state.donations].reverse().slice(0, 4);
  document.getElementById("recentDonations").innerHTML = recent.length ? recent.map((donation) => `
    <div class="donation-item">
      <strong>${escapeHTML(donation.donor)}</strong>
      <span>${escapeHTML(donation.type)} · ${escapeHTML(donation.details)} · ${escapeHTML(donation.area)}</span>
    </div>
  `).join("") : `<div class="empty-state">No donations yet.</div>`;
}

function renderTasks() {
  const filter = document.getElementById("taskFilter")?.value || "All";
  const tasks = state.requests
    .filter((request) => request.status !== "Delivered")
    .filter((request) => filter === "All" || request.priority === filter)
    .sort((a, b) => {
      const rank = { Critical: 1, High: 2, Medium: 3 };
      return rank[a.priority] - rank[b.priority];
    });

  const container = document.getElementById("taskList");
  container.innerHTML = tasks.length ? tasks.map((task) => `
    <article class="task-card">
      <div>
        <h3>${escapeHTML(task.type)} · ${escapeHTML(task.id)}</h3>
        <p>${escapeHTML(task.location)} — ${escapeHTML(task.message)}</p>
        <div class="badges">
          <span class="badge ${priorityClass(task.priority)}">${escapeHTML(task.priority)}</span>
          <span class="badge">${escapeHTML(task.status)}</span>
          <span class="badge green">${escapeHTML(task.assignedVolunteer || "Not assigned")}</span>
        </div>
      </div>
      <button class="btn btn-danger" data-accept-task="${task.id}">Accept</button>
    </article>
  `).join("") : `<div class="empty-state">No task available for this filter.</div>`;
}

function renderShelters() {
  const select = document.getElementById("shelterFilter");
  const districts = [...new Set(state.shelters.map((shelter) => shelter.district))].sort();
  const current = select.value || "All";
  select.innerHTML = `<option value="All">All districts</option>${districts.map((district) => `<option value="${escapeHTML(district)}">${escapeHTML(district)}</option>`).join("")}`;
  select.value = districts.includes(current) ? current : "All";

  const shelters = state.shelters.filter((shelter) => select.value === "All" || shelter.district === select.value);
  document.getElementById("shelterList").innerHTML = shelters.map((shelter) => `
    <article class="shelter-card">
      <div>
        <h3>${escapeHTML(shelter.name)}</h3>
        <p>${escapeHTML(shelter.address)} · ${escapeHTML(shelter.district)}</p>
        <div class="badges">
          <span class="badge">Contact: ${escapeHTML(shelter.contact)}</span>
          <span class="badge green">Available capacity</span>
        </div>
      </div>
      <div class="capacity" style="--capacity: ${shelter.capacity}%">${shelter.capacity}%</div>
    </article>
  `).join("");
}

function renderKpis() {
  const delivered = state.requests.filter((request) => request.status === "Delivered").length;
  const critical = state.requests.filter((request) => request.priority === "Critical" && request.status !== "Delivered").length;
  const kpis = [
    { label: "Total Requests", value: state.requests.length, note: "SOS and relief orders" },
    { label: "Open Emergencies", value: getOpenRequests().length, note: "Need attention" },
    { label: "Critical Priority", value: critical, note: "Highest urgency" },
    { label: "Delivered", value: delivered, note: "Completed relief" },
    { label: "Active Volunteers", value: state.volunteers.filter((v) => v.active).length, note: "Ready to respond" },
    { label: "Donation Fund", value: formatCurrency(getDonationTotal()), note: "Recorded pledges" }
  ];

  document.getElementById("kpiGrid").innerHTML = kpis.map((kpi) => `
    <div class="kpi-card">
      <strong>${escapeHTML(kpi.value)}</strong>
      <span>${escapeHTML(kpi.label)}</span>
      <small>${escapeHTML(kpi.note)}</small>
    </div>
  `).join("");
}

function renderRequestTable() {
  const filter = document.getElementById("requestStatusFilter")?.value || "All";
  const requests = state.requests.filter((request) => filter === "All" || request.status === filter);
  const tbody = document.getElementById("requestTable");

  tbody.innerHTML = requests.length ? requests.map((request) => `
    <tr>
      <td><strong>${escapeHTML(request.id)}</strong></td>
      <td>${escapeHTML(request.type)}</td>
      <td>${escapeHTML(request.location)}</td>
      <td><span class="badge ${priorityClass(request.priority)}">${escapeHTML(request.priority)}</span></td>
      <td><span class="badge">${escapeHTML(request.status)}</span></td>
      <td>
        <div class="action-buttons">
          <button class="tiny-btn" data-next-status="${request.id}">Next</button>
          <button class="tiny-btn danger" data-delete-request="${request.id}">Delete</button>
        </div>
      </td>
    </tr>
  `).join("") : `
    <tr><td colspan="6"><div class="empty-state">No request found.</div></td></tr>
  `;
}

function renderAnalytics() {
  const types = state.requests.reduce((acc, request) => {
    acc[request.type] = (acc[request.type] || 0) + 1;
    return acc;
  }, {});

  const max = Math.max(...Object.values(types), 1);
  const rows = Object.entries(types).map(([label, count]) => {
    const width = Math.max(12, Math.round((count / max) * 100));
    return `
      <div class="analytics-row">
        <div class="analytics-label"><span>${escapeHTML(label)}</span><span>${count}</span></div>
        <div class="analytics-track"><div class="analytics-fill" style="width:${width}%"></div></div>
      </div>
    `;
  }).join("");

  document.getElementById("analyticsBars").innerHTML = rows || `<div class="empty-state">No analytics available.</div>`;
}

function renderAll() {
  saveState();
  renderHeroStats();
  renderBasket();
  renderDonationProgress();
  renderTasks();
  renderShelters();
  renderKpis();
  renderRequestTable();
  renderAnalytics();
}

function createRequest({ name, phone, type, location, priority, message, source = "SOS" }) {
  const request = {
    id: nextId("HA", "request"),
    name,
    phone,
    type,
    location,
    priority,
    message,
    status: "Received",
    assignedVolunteer: "Not assigned",
    createdAt: currentDateTime(),
    source
  };
  state.requests.unshift(request);
  renderAll();
  return request;
}

function renderTracking(request) {
  const currentIndex = TRACKING_STEPS.indexOf(request.status);
  return `
    <div class="alert-preview success">
      <h3>${escapeHTML(request.id)} · ${escapeHTML(request.type)}</h3>
      <p><strong>Location:</strong> ${escapeHTML(request.location)}<br><strong>Priority:</strong> ${escapeHTML(request.priority)}<br><strong>Volunteer:</strong> ${escapeHTML(request.assignedVolunteer || "Not assigned")}</p>
      <div class="timeline">
        ${TRACKING_STEPS.map((step, index) => {
          const className = index < currentIndex ? "done" : index === currentIndex ? "current" : "";
          return `<div class="step ${className}">${escapeHTML(step)}</div>`;
        }).join("")}
      </div>
    </div>
  `;
}

function setupForms() {
  document.getElementById("sosForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const request = createRequest({
      name: form.get("name").trim(),
      phone: form.get("phone").trim(),
      type: form.get("type"),
      location: form.get("location").trim(),
      priority: form.get("priority"),
      message: form.get("message").trim(),
      source: "SOS"
    });

    document.getElementById("sosResult").classList.add("success");
    document.getElementById("sosResult").innerHTML = `
      <span class="card-icon danger">✓</span>
      <h3>Request received: ${escapeHTML(request.id)}</h3>
      <p>Your emergency request is now visible to admin and volunteers. Keep this ID for tracking.</p>
      ${renderTracking(request)}
    `;
    event.currentTarget.reset();
    notify(`SOS request ${request.id} submitted successfully.`);
  });

  document.getElementById("donationForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const donation = {
      id: nextId("DN", "donation"),
      donor: form.get("donor").trim(),
      contact: form.get("contact").trim(),
      type: form.get("donationType"),
      details: form.get("details").trim(),
      amount: form.get("donationType") === "Money" ? parseAmount(form.get("details")) : Math.max(500, parseAmount(form.get("details")) * 50),
      area: form.get("area").trim(),
      createdAt: currentDateTime()
    };
    state.donations.unshift(donation);
    event.currentTarget.reset();
    document.getElementById("donationType").value = "Money";
    document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.donationType === "Money"));
    renderAll();
    notify("Donation pledge saved with transparent progress update.");
  });

  document.getElementById("volunteerForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    state.volunteers.unshift({
      id: nextId("VL", "volunteer"),
      name: form.get("volunteerName").trim(),
      district: form.get("district").trim(),
      skill: form.get("skill"),
      active: true
    });
    event.currentTarget.reset();
    renderAll();
    notify("Volunteer profile added to the response team.");
  });

  document.getElementById("trackingForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const id = document.getElementById("trackingInput").value.trim().toUpperCase();
    const request = state.requests.find((item) => item.id.toUpperCase() === id);
    document.getElementById("trackingResult").innerHTML = request
      ? renderTracking(request)
      : `<div class="empty-state">No request found for "${escapeHTML(id)}". Try HA-1001 or submit a new SOS request.</div>`;
  });
}

function setupInteractions() {
  document.getElementById("navToggle").addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("nav-open");
    document.getElementById("navToggle").setAttribute("aria-expanded", String(isOpen));
  });

  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      document.body.classList.remove("nav-open");
      document.getElementById("navToggle").setAttribute("aria-expanded", "false");
    });
  });

  document.getElementById("detectLocation").addEventListener("click", () => {
    const input = document.getElementById("sosLocation");
    if (!navigator.geolocation) {
      input.value = "GPS not supported. Please type your location.";
      notify("GPS is not supported by this browser.");
      return;
    }
    input.value = "Detecting GPS location...";
    navigator.geolocation.getCurrentPosition(
      (position) => {
        input.value = `Lat ${position.coords.latitude.toFixed(5)}, Lon ${position.coords.longitude.toFixed(5)}`;
        notify("GPS location added to SOS form.");
      },
      () => {
        input.value = "GPS permission denied. Please type location manually.";
        notify("Please type the location manually.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });

  document.getElementById("reliefProducts").addEventListener("click", (event) => {
    const button = event.target.closest("[data-add-product]");
    if (!button) return;
    basket.push(button.dataset.addProduct);
    renderBasket();
    notify("Relief item added to basket.");
  });

  document.getElementById("basketItems").addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-basket]");
    if (!button) return;
    basket.splice(Number(button.dataset.removeBasket), 1);
    renderBasket();
  });

  document.getElementById("placeReliefOrder").addEventListener("click", () => {
    const area = document.getElementById("reliefArea").value.trim();
    if (!basket.length) {
      notify("Please select at least one relief item.");
      return;
    }
    if (!area) {
      notify("Please write the delivery area.");
      document.getElementById("reliefArea").focus();
      return;
    }
    const productNames = basket.map((id) => reliefProducts.find((item) => item.id === id)?.name).filter(Boolean);
    const request = createRequest({
      name: "Relief Item Request",
      phone: "Not provided",
      type: "Emergency Supplies",
      location: area,
      priority: productNames.includes("Rescue Support Pack") ? "Critical" : "High",
      message: `Requested items: ${productNames.join(", ")}.`,
      source: "Relief Order"
    });
    basket = [];
    document.getElementById("reliefArea").value = "";
    renderAll();
    document.getElementById("trackingInput").value = request.id;
    document.getElementById("trackingResult").innerHTML = renderTracking(request);
    notify(`Relief request ${request.id} placed successfully.`);
  });

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById("donationType").value = tab.dataset.donationType;
    });
  });

  document.getElementById("taskFilter").addEventListener("change", renderTasks);
  document.getElementById("shelterFilter").addEventListener("change", renderShelters);
  document.getElementById("requestStatusFilter").addEventListener("change", renderRequestTable);

  document.getElementById("taskList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-accept-task]");
    if (!button) return;
    const request = state.requests.find((item) => item.id === button.dataset.acceptTask);
    if (!request) return;
    const volunteer = state.volunteers[0];
    request.assignedVolunteer = volunteer ? volunteer.name : "Volunteer team";
    request.status = request.status === "Received" ? "Assigned" : request.status;
    renderAll();
    notify(`${request.id} accepted by ${request.assignedVolunteer}.`);
  });

  document.getElementById("requestTable").addEventListener("click", (event) => {
    const nextButton = event.target.closest("[data-next-status]");
    const deleteButton = event.target.closest("[data-delete-request]");

    if (nextButton) {
      const request = state.requests.find((item) => item.id === nextButton.dataset.nextStatus);
      if (!request) return;
      const index = TRACKING_STEPS.indexOf(request.status);
      request.status = TRACKING_STEPS[Math.min(index + 1, TRACKING_STEPS.length - 1)] || "Verified";
      if (request.status === "Assigned" && request.assignedVolunteer === "Not assigned") {
        request.assignedVolunteer = state.volunteers[0]?.name || "Volunteer team";
      }
      renderAll();
      notify(`${request.id} moved to ${request.status}.`);
    }

    if (deleteButton) {
      state.requests = state.requests.filter((item) => item.id !== deleteButton.dataset.deleteRequest);
      renderAll();
      notify("Request removed from dashboard.");
    }
  });

  document.getElementById("resetDemo").addEventListener("click", () => {
    if (!confirm("Reset all demo data to original sample data?")) return;
    state = structuredClone(seedState);
    basket = [];
    renderAll();
    notify("Demo data reset successfully.");
  });
}

function setupRevealAnimation() {
  const elements = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  elements.forEach((element) => observer.observe(element));
}

function setupActiveNav() {
  const sections = ["sos", "relief", "donate", "volunteer", "shelter", "tracking", "dashboard"]
    .map((id) => document.getElementById(id));
  const navLinks = [...document.querySelectorAll(".nav-links a")];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
    });
  }, { rootMargin: "-45% 0px -45% 0px" });

  sections.filter(Boolean).forEach((section) => observer.observe(section));
}

function init() {
  renderReliefProducts();
  renderAll();
  setupForms();
  setupInteractions();
  setupRevealAnimation();
  setupActiveNav();

  document.getElementById("trackingInput").value = state.requests[0]?.id || "";
  if (state.requests[0]) {
    document.getElementById("trackingResult").innerHTML = renderTracking(state.requests[0]);
  }
}

document.addEventListener("DOMContentLoaded", init);
