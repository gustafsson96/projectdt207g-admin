"use strict";

const protectedContent = document.getElementById("protected-content");
const menuItemTable = document.getElementById("menu-item-table-body");
const token = localStorage.getItem("token");

// Check if token exists
if (!token) {
    userFeedback("You must be logged in to view this page.", true);
    setTimeout(() => {
        window.location.href = "index.html";
    }, 3000);
    // Fetch data if token exists
} else {
    // Display initially hidden admin content
    document.getElementById("protected-content").style.display = "block";

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
            // Display table of menu items
            if (data && data.length > 0) {
                menuItemTable.innerHTML = "";
            
                data.forEach(menuItem => {
                    const tr = document.createElement("tr");
            
                    // Name column
                    const nameTd = document.createElement("td");
                    nameTd.textContent = menuItem.name;
                    tr.appendChild(nameTd);
            
                    // Ingredients column (join array to string)
                    const ingredientsTd = document.createElement("td");
                    ingredientsTd.textContent = menuItem.ingredients.join(", ");
                    tr.appendChild(ingredientsTd);
            
                    // Price column
                    const priceTd = document.createElement("td");
                    priceTd.textContent = `$${menuItem.price.toFixed(2)}`;
                    tr.appendChild(priceTd);
            
                    // Vegan alternative column
                    const veganTd = document.createElement("td");
                    veganTd.textContent = menuItem.vegan_alternative ? "Yes" : "No";
                    tr.appendChild(veganTd);
            
                    // Update button column
                    const updateTd = document.createElement("td");
                    const updateBtn = document.createElement("button");
                    updateBtn.textContent = "Update";
                    updateBtn.addEventListener("click", () => {
                        // update logic here
                        console.log("Update for: ", menuItem._id);
                    });
                    updateTd.appendChild(updateBtn);
                    tr.appendChild(updateTd);
            
                    // Delete button column
                    const deleteTd = document.createElement("td");
                    const deleteBtn = document.createElement("button");
                    deleteBtn.textContent = "Delete";
                    deleteBtn.addEventListener("click", () => {
                        // delete route here
                        if (confirm(`Are you sure you want to delete "${menuItem.name}"?`)) {
                            fetch(`https://projectdt207g-api.onrender.com/menu/${menuItem._id}`, {
                                method: "DELETE",
                                headers: {
                                    "Authorization": `Bearer ${token}`,
                                }
                            })
                            .then(res => {
                                if (res.ok) {
                                    tr.remove(); // Remove row if delete was successful
                                    alert("Deleted successfully");
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
                menuItemTable.innerHTML = `<tr><td colspan="6">No menu items found.</td></tr>`;
            }
        })
        .catch(error => {
            console.error("Error fetching menu items: ", error);
            userFeedback("Failed to load menu items.", true);
        });
}

// Add new menu item
document.getElementById("add-menu-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("item-name").value.trim();
    const ingredientsRaw = document.getElementById("item-ingredients").value.trim();
    const price = parseFloat(document.getElementById("item-price").value);
    const veganAlternative = document.getElementById("item-vegan").checked;

    const ingredients = ingredientsRaw.split(",").map(i => i.trim()).filter(i => i.length > 0);

    const newItem = { name, ingredients, price, vegan_alternative: veganAlternative };

    try {
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
            formFeedback(data.message || "Failed to add menu item.", true);
            return;
        }

        formFeedback(data.message || "Menu item added!", false);

        // Reset form
        e.target.reset();

        // Refresh table
        location.reload();
    } catch (err) {
        console.error("Add item error:", err);
        formFeedback("An unexpected error occurred. Please try again.", true);
    }
});

// Logout user
document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "index.html";
});