const API = "http://127.0.0.1:5001/api";

/* ================= AUTH ================= */

// LOGIN
console.log("script.js loaded");

async function login() {
  console.log("Login clicked");

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!email || !password) {
    alert("Enter email and password");
    return;
  }

  try {
    const res = await fetch("http://127.0.0.1:5001/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.msg || "Login failed");
      return;
    }

    localStorage.setItem("userId", data.userId);
    localStorage.setItem("userName", data.userName);
    localStorage.setItem("uniPoints", data.uniPoints);

    window.location.href = "dashboard.html";

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    alert("Server error");
  }
}






// LOGOUT
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

/* ================= DASHBOARD ================= */

async function loadDashboard() {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    alert("Please login again");
    window.location.replace("login.html");
    return;
  }

  /* ===== USER ===== */
  const resUser = await fetch(`http://127.0.0.1:5001/api/users/${userId}`);
  const user = await resUser.json();

  document.getElementById("username").innerText = user.name || "User";
  document.getElementById("uniPoints").innerText = user.uniPoints || 0;

  /* ===== COHORT STATS ===== */
  const resMy = await fetch(
    `http://127.0.0.1:5001/api/cohorts/my/${userId}`
  );
  const my = await resMy.json();

  document.getElementById("createdCount").innerText =
    my.created?.length || 0;
  document.getElementById("joinedCount").innerText =
    my.joined?.length || 0;

  /* ===== SKILLS ===== */
  const teachList = document.getElementById("teachSkills");
  const learnList = document.getElementById("learnSkills");

  teachList.innerHTML = "";
  learnList.innerHTML = "";

  if (user.teachSkills?.length) {
    user.teachSkills.forEach(skill => {
      const li = document.createElement("li");
      li.textContent = skill;
      teachList.appendChild(li);
    });
  } else {
    teachList.innerHTML = "<li>No teaching skills yet</li>";
  }

  if (user.learnSkills?.length) {
    user.learnSkills.forEach(skill => {
      const li = document.createElement("li");
      li.textContent = skill;
      learnList.appendChild(li);
    });
  } else {
    learnList.innerHTML = "<li>No learning skills yet</li>";
  }
}


document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("dashboardPage")) {
    loadDashboard();
  }
});

/* ================= COHORTS ================= */
async function createCohort() {
  const input = document.getElementById("cohortName");
  const name = input.value.trim();

  if (!name) {
    alert("Please enter a cohort name");
    return;
  }

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  try {
    const res = await fetch(`${API}/cohorts/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name,
        createdBy: userId
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.msg || "Failed to create cohort");
      return;
    }

    input.value = "";
    loadCohorts(); // 🔥 refresh list
  } catch (err) {
    console.error("CREATE COHORT ERROR:", err);
    alert("Server error");
  }
}
 


async function loadCohorts() {
  const userId = localStorage.getItem("userId");
  const list = document.getElementById("cohortList");

  if (!list) return;
  list.innerHTML = "";

  const res = await fetch(`${API}/cohorts`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

  const data = await res.json();

  if (!Array.isArray(data) || !data.length) {
    list.innerHTML = `<p class="empty">No cohorts yet. Create one 👆</p>`;
    return;
  }

  data.forEach(c => {
    const creatorId =
      typeof c.createdBy === "object"
        ? c.createdBy._id
        : c.createdBy;

    const isCreator = creatorId === userId;

    list.innerHTML += `
      <div class="cohort-card" id="cohort-${c._id}">
        <div class="cohort-card-header">
          <h3>${c.name}</h3>
          <span>${c.members?.length || 0} Members</span>
        </div>

        <div class="cohort-actions">
          <button onclick="joinCohort('${c._id}')">Join</button>

          <!-- ✅ THIS IS THE KEY FIX -->
          <button onclick="openCohort('${c._id}', '${c.name}')">
            Chat
          </button>

          ${
            isCreator
              ? `<button class="delete" onclick="deleteCohort('${c._id}')">Delete</button>`
              : ``
          }
        </div>
      </div>
    `;
  });
}


async function joinCohort(id) {
  const userId = localStorage.getItem("userId");

  const res = await fetch(`${API}/cohorts/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify({ cohortId: id, userId })
  });

  const data = await res.json();
  alert(data.msg);

  if (res.ok) {
    loadCohorts(); // ✅ refresh members count
  }
}


async function deleteCohort(cohortId) {
  if (!confirm("Delete this cohort?")) return;

  const userId = localStorage.getItem("userId");

  const res = await fetch(`${API}/cohorts/${cohortId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ userId })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.msg || "Delete failed");
    return;
  }

  // ✅ remove card
  const card = document.getElementById(`cohort-${cohortId}`);
  if (card) card.remove();
}




function enterChat(id, name) {
  localStorage.setItem("currentCohort", id);
  localStorage.setItem("currentCohortName", name);
  window.location.href = "chat.html";
}

/* ================= CHAT ================= */
/* ================= CHAT ================= */

let socket;
let cohortId;

async function initChat() {
  cohortId = localStorage.getItem("currentCohortId");

  if (!cohortId) {
    alert("No cohort selected");
    return;
  }

  // show cohort name
  const title = document.getElementById("roomTitle");
  if (title) {
    title.innerText =
      localStorage.getItem("currentCohortName") || "Cohort Room";
  }

  // connect socket
  socket = io("http://127.0.0.1:5001");
  socket.emit("joinRoom", cohortId);

  socket.on("receiveMessage", addMessage);
  socket.on("messageRated", (data) => {
    const span = document.getElementById(`rate-${data.messageId}`);
    if (span) span.innerText = data.rating;
  });

  socket.on("messageDeleted", (id) => {
    const el = document.getElementById(`msg-${id}`);
    if (el) el.remove();
  });

  // load old messages
  const res = await fetch(`${API}/messages/${cohortId}`);
  const messages = await res.json();
  messages.forEach(addMessage);

  // ✅ LOAD RESOURCES CORRECTLY
  loadResources();
}


/* ================= SEND TEXT MESSAGE ================= */

function sendMessage() {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();

  if (!text) return;

  socket.emit("sendMessage", {
    cohortId,
    userId: localStorage.getItem("userId"),
    userName: localStorage.getItem("userName"),
    text,
    messageType: "text"
  });

  input.value = "";
}


/* ================= PDF (UPLOAD + URL) ================= */

async function sendPdf() {
  const fileInput = document.getElementById("pdfFile");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please choose a PDF file");
    return;
  }

  const fd = new FormData();
  fd.append("file", file); // ✅ FIX 1

  try {
    const res = await fetch("http://127.0.0.1:5001/api/upload", { // ✅ FIX 2
      method: "POST",
      body: fd
    });

    if (!res.ok) throw new Error("Upload failed");

    const data = await res.json();

    socket.emit("sendMessage", {
      cohortId,
      userId: localStorage.getItem("userId"),
      userName: localStorage.getItem("userName"),
      messageType: "file",
      fileUrl: data.fileUrl,
      fileName: data.fileName
    });

    fileInput.value = "";
  } catch (err) {
    console.error(err);
    alert("PDF upload failed");
  }
}


function sendLink() {
  const input = document.getElementById("linkUrl");
  const url = input.value.trim();

  if (!url) {
    alert("Paste a link");
    return;
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    alert("Link must start with http:// or https://");
    return;
  }

  socket.emit("sendMessage", {
    cohortId,
    userId: localStorage.getItem("userId"),
    userName: localStorage.getItem("userName"),
    messageType: "link",
    linkUrl: url
  });

  input.value = "";
}

/* ================= RENDER ================= */
function addMessage(msg) {
  const chatBox = document.getElementById("chatBox");
  const myId = localStorage.getItem("userId");

  const div = document.createElement("div");
  div.className = "chat-message";
  div.id = `msg-${msg._id}`;

  let content = "";

  /* ================= TEXT MESSAGE ================= */
  if (msg.messageType === "text" && msg.text) {
    content = msg.text;
  }

  /* ================= FILE / PDF MESSAGE ================= */
  if (msg.messageType === "file" && msg.fileUrl) {
    const displayName =
      msg.fileName || msg.fileUrl.split("/").pop();

    content = `
      <a href="${msg.fileUrl}" target="_blank">
        📄 ${displayName}
      </a>
    `;
  }

  /* ================= LINK MESSAGE ================= */
  if (msg.messageType === "link" && msg.linkUrl) {
    content = `
      <a href="${msg.linkUrl}" target="_blank">
        🔗 ${msg.linkUrl}
      </a>
    `;
  }

  div.innerHTML = `
    <b>${msg.userName}</b><br/>
    ${content}
    <div>
      ${
        msg.userId !== myId
          ? `<button onclick="rateMessage('${msg._id}')">
              ⭐ <span id="rate-${msg._id}">${msg.rating}</span>
            </button>`
          : `⭐ ${msg.rating}`
      }
    </div>
  `;

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}


function rateMessage(messageId) {
  socket.emit("rateMessage", {
    messageId,
    userId: localStorage.getItem("userId")
  });
}

/* ================= RESOURCES ================= */
async function loadResources() {
  const cohortId = localStorage.getItem("currentCohortId");
  const list = document.getElementById("resourceList");

  if (!cohortId || !list) return;

  try {
    const res = await fetch(
      `${API}/messages/resources/${cohortId}`
    );

    const data = await res.json();

    list.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      list.innerHTML = "<p class='empty'>No resources yet</p>";
      return;
    }

    data.forEach(item => {
      if (!item.fileUrl) return;

      const fileName = item.fileUrl.split("/").pop();

      const div = document.createElement("div");
      div.className = "resource-item";

      div.innerHTML = `
        📄<a href="${item.fileUrl}" target= "_blank">

          ${fileName}
        </a>
      `;

      list.appendChild(div);
    });

  } catch (err) {
    console.error("LOAD RESOURCES ERROR:", err);
  }
}


function renderSkills() {
  const teach = (localStorage.getItem("teachSkills") || "")
    .split(",")
    .filter(Boolean);

  const learn = (localStorage.getItem("learnSkills") || "")
    .split(",")
    .filter(Boolean);

  // Teaching skills (no fake progress)
  document.getElementById("teachSkills").innerHTML =
    teach.length === 0
      ? `<p class="empty-skill">No teaching skills added yet</p>`
      : teach.map(s => `
          <div class="skill">
            <span>${s}</span>
          </div>
        `).join("");

  // Learning skills (no fake progress)
  document.getElementById("learnSkills").innerHTML =
    learn.length === 0
      ? `<p class="empty-skill">No learning skills added yet</p>`
      : learn.map(s => `
          <div class="skill">
            <span>${s}</span>
          </div>
        `).join("");
}


function renderRewards() {
  const points = Number(localStorage.getItem("uniPoints") || 0);

  document.querySelectorAll(".circle").forEach(c => {
    const need = Number(c.dataset.need);
    const percent = Math.min((points / need) * 100, 100);

    c.style.background =
      `conic-gradient(#4f7cff ${percent}%, #ddd 0%)`;

    c.innerHTML = `<b>${Math.floor(percent)}%</b>`;
  });
}

async function loadPopularCohorts() {
  try {
    const res = await fetch("http://127.0.0.1:5001/api/cohorts/popular");
    const cohorts = await res.json();

    const container = document.getElementById("popularCohorts");
    container.innerHTML = "";

    cohorts.slice(0, 3).forEach(c => {
      container.innerHTML += `
        <div class="cohort-card">
          <h3>${c.name}</h3>
          <p>${c.members.length} members</p>
        </div>
      `;
    });
  } catch (err) {
    console.error("Failed to load cohorts");
  }
}
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}


async function loadLibrary() {
  const res = await fetch(`${API}/messages/library/all`);
  const data = await res.json();

  const list = document.getElementById("libraryList");
  if (!list) return;

  list.innerHTML = "";
  data.forEach(r => {
    list.innerHTML += `
      <div>
        📄 <a href="${r.fileUrl}" target="_blank">

          ${r.fileName || "Resource"}
        </a>
      </div>
    `;
  });
}


function openCohort(cohortId, cohortName) {
  console.log("Opening cohort:", cohortId); // 👈 debug

  localStorage.setItem("currentCohortId", cohortId);
  localStorage.setItem("currentCohortName", cohortName);

  window.location.href = "chat.html";
}


/* 


/* ================= NAV ================= */

function backToCohorts() {
  window.location.href = "cohorts.html";
}
function goLeaderboard() {
  window.location.href = "leaderboard.html";
}

function goDashboard() {
  window.location.href = "dashboard.html";
}

function goToCohorts() {
  window.location.href = "cohorts.html";
}

function goHome() {
  window.location.href = "index.html";
}

function goHome() {
  window.location.href = "dashboard.html"; 
  // or "index.html" if that’s your home
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("dashboardPage")) {
    loadDashboard();
  }
});

