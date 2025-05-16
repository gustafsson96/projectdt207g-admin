"use strict";

const menuItemLi = document.getElementById("menu-item-list");
const token = localStorage.getItem("token");

// Check if token exists
if (!token) {
    userFeedback("You must be logged in to view this page.", true);
    setTimeout(() => {
        window.location.href = "index.html";
    }, 3000);
    // Fetch data if token exists
} else {
    fetch("https://projectdt207g-api.onrender.com/menu")
        .then(async res => {
            // Handle authorization errors if request fails
            if (!res.ok) {
                const errorData = await res.json();
                const errorMessage = errorData.message || "Authorization failed.";

                userFeedback(errorMessage, true);
                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem("token");
                    setTimeout(() => {
                        window.location.href = "index.html";
                    }, 3000);
                }
                return null;
            }

            // Return data
            return res.json();
        })
        .then(data => {
            if (!data) return;
            // Display list of menu items
            if (data && data.length > 0) {
                data.forEach(menuItem => {
                    const li = document.createElement("li");
                    li.textContent = menuItem.name;
                    menuItemLi.appendChild(li);
                });
            } else {
                menuItemLi.innerHTML = "<li>No menu items found.</li>";
            }
        })
        .catch(error => {
            console.error("Error fetching menu items: ", error);
            userFeedback("Failed to load menu items.", true);
        });
}

// Logout user
document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "index.html";
});