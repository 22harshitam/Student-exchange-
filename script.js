function login() {
    const email = document.getElementById("email").value.trim();
    const pass = document.getElementById("password").value.trim();
    const error = document.getElementById("errorMsg");

    // Clear error
    error.textContent = "";

    // Validation
    if (!email.endsWith("@bmsce.ac.in")) {
        error.textContent = "Only BMSCE email IDs allowed!";
        return;
    }

    if (pass.length < 6) {
        error.textContent = "Password must be at least 6 characters!";
        return;
    }

    // Save user data
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userName", email.split("@")[0]);

    // Redirect to dashboard
    window.location.href = "dashboard.html";
}

