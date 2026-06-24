let libraryData = [];

async function loadLibrary() {
  const res = await fetch("http://127.0.0.1:5001/api/messages/library/all");
  libraryData = await res.json();
  renderLibrary(libraryData);
}

function renderLibrary(data) {
  const list = document.getElementById("libraryList");
  list.innerHTML = "";

  data.forEach(item => {
    if (!item.fileUrl) return;

    const fileName = item.fileName || item.fileUrl.split("/").pop();
    const link = `http://127.0.0.1:5001${item.fileUrl}`;

    const card = document.createElement("div");
    card.className = "lib-card";

    card.innerHTML = `
      <div class="lib-left">
        <div class="lib-icon">📄</div>
        <div class="lib-info">
          <h3>${fileName}</h3>
        </div>
      </div>

      <a class="lib-btn" href="${link}" target="_blank" download>
        Download
      </a>
    `;

    list.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", loadLibrary);
