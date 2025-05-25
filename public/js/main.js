"use strict";

// Attach submit handler to the login form
document.getElementById("login-form").addEventListener("submit", loginUser);

// API endpoint for admin login
const url = "https://projectdt207g-api.onrender.com/admin/login";

// Handle login form submission
async function loginUser(e) {
    e.preventDefault(); // Prevent default form submission

    // Get input values for username and password
    const usernameInput = document.getElementById("login-username").value;
    const passwordInput = document.getElementById("login-password").value;

    // Basic validation to ensure both fields have values
    if (!usernameInput || !passwordInput) {
        userFeedback("Please enter both username and password", true, "user-feedback");
        return;
    }

    const user = {
        username: usernameInput,
        password: passwordInput
    };

    try {
        const resp = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        });

        if (resp.ok) {
            const data = await resp.json();

            // Save JWT token to localStorage 
            localStorage.setItem("token", data.token);

            // Redirect user to admin page after successful login
            window.location.href = "admin.html";
        } else {
            const errorData = await resp.json();
            const errorMessage = errorData.message || errorData.error || "Login failed";
            userFeedback(errorMessage, true, "user-feedback");
        }

    } catch (error) {
        userFeedback("An error occurred during login. Please try again.", true, "user-feedback");
        console.error(error);
    }
}