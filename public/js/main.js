"use strict";

document.getElementById("login-form").addEventListener("submit", loginUser);

const url = "https://projectdt207g-api.onrender.com/admin/login";

// Login user
async function loginUser(e) {
    e.preventDefault();

    const usernameInput = document.getElementById("login-username").value;
    const passwordInput = document.getElementById("login-password").value;

    if (!usernameInput || !passwordInput) {
        userFeedback("Please enter both username and password");
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
            localStorage.setItem("token", data.token);
            window.location.href = "admin.html";
        } else {
            const errorData = await resp.json();
            const errorMessage = errorData.message || errorData.error || "Login failed";
            userFeedback(errorMessage);
        }

    } catch (error) {
        userFeedback("An error occurred during login. Please try again.");
        console.error(error);
    }
}