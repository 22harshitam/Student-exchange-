document.addEventListener("DOMContentLoaded", async () => {
  const userId = localStorage.getItem("userId");
  if (!userId) return;

  const res = await fetch(`http://localhost:5001/api/users/${userId}/points`);
  const data = await res.json();

  const uniPoints = data.uniPoints || 0;

  document.querySelectorAll(".progress-circle").forEach(circle => {
    const target = Number(circle.dataset.target); // 100 or 150

    let progress = Math.floor((uniPoints / target) * 100);
    progress = Math.min(progress, 100);

    circle.style.setProperty("--progress", progress);
    circle.querySelector("span").innerText = progress + "%";
  });
});
