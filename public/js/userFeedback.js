"use strict";

// Function to display general user feedback
function userFeedback(message, isError = true) {
    const feedback = document.getElementById("user-feedback");
    feedback.textContent = message;
    feedback.style.color = isError ? "red" : "green";

    if (feedback.timeoutId) {
        clearTimeout(feedback.timeoutId);
    }

    feedback.timeoutId = setTimeout(() => {
        feedback.textContent = "";
    }, 5000);
}

// Function to display user form feedback (for adding/updating item)
function formFeedback(message, isError = true) {
    const feedback = document.getElementById("form-feedback");
    if (!feedback) return;

    feedback.textContent = message;
    feedback.style.color = isError ? "red" : "green";

    if (feedback.timeoutId) {
        clearTimeout(feedback.timeoutId);
    }

    feedback.timeoutId = setTimeout(() => {
        feedback.textContent = "";
    }, 5000);
}