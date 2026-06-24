async function signup() {
  const body = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,

    teachSkills: document
      .getElementById("teachSkills")
      .value.split(",")
      .map(s => s.trim())
      .filter(Boolean),

    learnSkills: document
      .getElementById("learnSkills")
      .value.split(",")
      .map(s => s.trim())
      .filter(Boolean)
  };

  if (!body.name || !body.email || !body.password) {
    alert("Please fill all required fields");
    return;
  }

  try {
    const res = await fetch("http://127.0.0.1:5001/api/auth/signup", {

      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.msg || "Signup failed");
      return;
    }

    alert("Signup successful! Please login.");
    window.location.href = "login.html";

  } catch (err) {
    console.error(err);
    alert("Server error");
  }
}
