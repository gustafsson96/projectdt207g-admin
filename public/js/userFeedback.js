"use strict";

// Function to display general user feedback
function userFeedback(message, isError = true, containerId = "menu-feedback") {
    const container = document.getElementById(containerId);

    container.textContent = message;
    container.style.color = isError ? "red" : "green";
    container.style.display = "block";

    setTimeout(() => {
        container.style.display = "none";
    }, 3000);
}