"use strict";

const protectedContent = document.getElementById("protected-content");
const menuItemTable = document.getElementById("menu-item-table-body");
const token = localStorage.getItem("token");

// Redirect if no token is found
if (!token) {
    userFeedback("You must be logged in to view this page.", true, "protected-feedback");
    setTimeout(() => {
        window.location.href = "index.html";
    }, 3000);
} else {
    // Show protected content after login
    document.getElementById("protected-content").style.display = "block";

    // Load menu items from API and display in admin table
    async function loadMenuItems() {
        try {
            const res = await fetch("https://projectdt207g-api.onrender.com/menu");
            if (!res.ok) {
                const errorData = await res.json();
                const errorMessage = errorData.message || "Authorization failed.";
                userFeedback(errorMessage, true, "menu-feedback");

                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem("token"); // Clear token if unauthorized
                    setTimeout(() => {
                        window.location.href = "index.html";
                    }, 3000);
                }
                return;
            }
            const data = await res.json();

            if (data.length > 0) {
                menuItemTable.innerHTML = "";

                data.forEach(menuItem => {
                    const tr = document.createElement("tr");

                    // Fill table columns: name, categorym ingredients, price, vegan alternative
                    const nameTd = document.createElement("td");
                    nameTd.textContent = menuItem.name;
                    tr.appendChild(nameTd);

                    const categoryTd = document.createElement("td");
                    categoryTd.textContent = menuItem.category;
                    tr.appendChild(categoryTd);

                    const ingredientsTd = document.createElement("td");
                    ingredientsTd.textContent = menuItem.ingredients.join(", ");
                    tr.appendChild(ingredientsTd);

                    const priceTd = document.createElement("td");
                    priceTd.textContent = `$${menuItem.price.toFixed(2)}`;
                    tr.appendChild(priceTd);

                    const veganTd = document.createElement("td");
                    veganTd.textContent = menuItem.vegan_alternative ? "Yes" : "No";
                    tr.appendChild(veganTd);

                    // Update button and handler
                    const updateTd = document.createElement("td");
                    const updateBtn = document.createElement("button");
                    updateBtn.textContent = "Update";

                    updateBtn.addEventListener("click", () => {
                        const existingEditRow = document.querySelector("tr.editing-row");
                        if (existingEditRow) {
                            existingEditRow.previousSibling.querySelector("button").disabled = false;
                            existingEditRow.remove();
                        }

                        const editRow = document.createElement("tr");
                        editRow.classList.add("editing-row");

                        editRow.innerHTML = `
                            <td><input type="text" value="${menuItem.name}" id="edit-name-${menuItem._id}"></td>
                            <td><input type="text" value="${menuItem.category}" id="edit-category-${menuItem._id}"></td>
                            <td><input type="text" value="${menuItem.ingredients.join(", ")}" id="edit-ingredients-${menuItem._id}"></td>
                            <td><input type="number" step="0.01" value="${menuItem.price}" id="edit-price-${menuItem._id}"></td>
                            <td><input type="checkbox" id="edit-vegan-${menuItem._id}" ${menuItem.vegan_alternative ? "checked" : ""}></td>
                            <td colspan="2">
                                <button id="save-${menuItem._id}">Save</button>
                                <button id="cancel-${menuItem._id}">Cancel</button>
                            </td>
                        `;

                        tr.after(editRow);
                        updateBtn.disabled = true;

                        // Cancel edit
                        document.getElementById(`cancel-${menuItem._id}`).addEventListener("click", () => {
                            editRow.remove();
                            updateBtn.disabled = false;
                        });

                        // Save edit (PUT request)
                        document.getElementById(`save-${menuItem._id}`).addEventListener("click", async () => {
                            const updatedItem = {
                                name: document.getElementById(`edit-name-${menuItem._id}`).value.trim(),
                                category: document.getElementById(`edit-category-${menuItem._id}`).value.trim(),
                                ingredients: document.getElementById(`edit-ingredients-${menuItem._id}`).value.split(",").map(i => i.trim()),
                                price: parseFloat(document.getElementById(`edit-price-${menuItem._id}`).value),
                                vegan_alternative: document.getElementById(`edit-vegan-${menuItem._id}`).checked
                            };

                            try {
                                const res = await fetch(`https://projectdt207g-api.onrender.com/menu/${menuItem._id}`, {
                                    method: "PUT",
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": `Bearer ${token}`
                                    },
                                    body: JSON.stringify(updatedItem)
                                });

                                const result = await res.json();

                                if (!res.ok) {
                                    alert(result.message || "Failed to update item");
                                    return;
                                }

                                userFeedback("Menu item updated successfully.", false, "menu-feedback");
                                loadMenuItems(); // Refresh the list
                            } catch (err) {
                                console.error("Update error:", err);
                                alert("An error occurred while updating.");
                            }
                        });
                    });

                    // Delete button and handler (DELETE)
                    updateTd.appendChild(updateBtn);
                    tr.appendChild(updateTd);

                    const deleteTd = document.createElement("td");
                    const deleteBtn = document.createElement("button");
                    deleteBtn.textContent = "Delete";
                    deleteBtn.addEventListener("click", () => {
                        if (confirm(`Are you sure you want to delete "${menuItem.name}"?`)) {
                            fetch(`https://projectdt207g-api.onrender.com/menu/${menuItem._id}`, {
                                method: "DELETE",
                                headers: {
                                    "Authorization": `Bearer ${token}`,
                                }
                            })
                                .then(res => {
                                    if (res.ok) {
                                        tr.remove(); // Remove the row
                                        userFeedback("Deleted successfully", false, "menu-feedback");
                                    } else {
                                        alert("Failed to delete item");
                                    }
                                });
                        }
                    });
                    deleteTd.appendChild(deleteBtn);
                    tr.appendChild(deleteTd);

                    menuItemTable.appendChild(tr);
                });
            } else {
                menuItemTable.innerHTML = `<tr class="no-data"><td colspan="7">No menu items found.</td></tr>`;
            }
        } catch (error) {
            console.error("Error fetching menu items: ", error);
            userFeedback("Failed to load menu items.", true, "menu-feedback");
        }
    }

    // Add new menu item form submission handler (POST)
    document.getElementById("add-menu-form").addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("item-name").value.trim();
        const category = document.getElementById("item-category").value.trim();
        const ingredientsRaw = document.getElementById("item-ingredients").value.trim();
        const price = parseFloat(document.getElementById("item-price").value);
        const veganAlternative = document.getElementById("item-vegan").checked;

        const ingredients = ingredientsRaw.split(",").map(i => i.trim()).filter(i => i.length > 0);

        const newItem = { name, category, ingredients, price, vegan_alternative: veganAlternative };

        try {
            // Fetch all reservations from the API with authorization token
            const res = await fetch("https://projectdt207g-api.onrender.com/menu", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(newItem)
            });

            const data = await res.json();

            if (!res.ok) {
                userFeedback(data.message || "Failed to add menu item.", true, "form-feedback");
                return;
            }

            userFeedback(data.message || "Menu item added!", false, "form-feedback");
            e.target.reset();
            loadMenuItems(); // Refresh menu list
        } catch (err) {
            console.error("Add item error:", err);
            userFeedback("An unexpected error occurred. Please try again.", true, "form-feedback");
        }
    });

    /* Load reservations for admin */
    async function loadReservations() {
        try {
            const res = await fetch("https://projectdt207g-api.onrender.com/reservation", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const errorData = await res.json();
                const errorMessage = errorData.message || "Failed to load reservations.";
                userFeedback(errorMessage, true, "reservation-feedback");

                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem("token");
                    setTimeout(() => {
                        window.location.href = "index.html";
                    }, 3000);
                }
                return;
            }

            const reservations = await res.json();
            const tbody = document.getElementById("reservations-table-body");
            tbody.innerHTML = "";

            // Display message if no reservations are found
            if (reservations.length === 0) {
                tbody.innerHTML = `<tr class="no-data"><td colspan="6">No reservations found.</td></tr>`;
                return;
            }

            // Create table rows for each reservation
            reservations.forEach(reservation => {
                const tr = document.createElement("tr");

                // Populate table cells 
                tr.innerHTML = `
                    <td>${reservation.name}</td>
                    <td>${reservation.email}</td>
                    <td>${reservation.partySize}</td>
                    <td>${new Date(reservation.dateTime).toLocaleString()}</td>
                    <td>${reservation.specialRequest || ""}</td>
                    <td><button class="delete-reservation-btn">Delete</button></td>
                `;

                // Delete reservation button
                const deleteBtn = tr.querySelector(".delete-reservation-btn");
                deleteBtn.addEventListener("click", () => {
                    // Confirm deletion
                    if (confirm(`Are you sure you want to delete the reservation for "${reservation.name}"?`)) {
                        // Send DELETE request to the API
                        fetch(`https://projectdt207g-api.onrender.com/reservation/${reservation._id}`, {
                            method: "DELETE",
                            headers: {
                                "Authorization": `Bearer ${token}`,
                            }
                        }).then(delRes => {
                            if (delRes.ok) {
                                tr.remove();
                                userFeedback("Reservation deleted successfully.", false, "reservation-feedback");
                            } else {
                                alert("Failed to delete reservation.");
                            }
                        }).catch(err => {
                            console.error("Delete error:", err);
                            alert("An error occurred while deleting.");
                        });
                    }
                });
                // Append row to reservations table
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error("Error fetching reservations:", error);
            userFeedback("Failed to load reservations.", true, "reservation-feedback");
        }
    }

    // Inital load of data
    loadMenuItems();
    loadReservations();

    // Logout button handler (clears token)
    document.getElementById("logout-btn").addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.href = "index.html";
    });
}