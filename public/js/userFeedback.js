"use strict";

// Function to display general user feedback
function userFeedback(message, isError = true, containerId = "menu-feedback") {
    // Get feedback container by ID
    const container = document.getElementById(containerId);

    container.textContent = message;
    container.style.color = isError ? "red" : "green";
    container.style.display = "block";

    // Clear after 3 seconds
    setTimeout(() => {
        container.style.display = "none";
    }, 3000);
}