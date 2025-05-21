"use strict";

const protectedContent = document.getElementById("protected-content");
const menuItemTable = document.getElementById("menu-item-table-body");
const token = localStorage.getItem("token");

if (!token) {
    userFeedback("You must be logged in to view this page.", true);
    setTimeout(() => {
        window.location.href = "index.html";
    }, 3000);
} else {
    document.getElementById("protected-content").style.display = "block";

    fetch("https://projectdt207g-api.onrender.com/menu")
        .then(async res => {
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
            return res.json();
        })
        .then(data => {
            if (!data) return;

            if (data && data.length > 0) {
                menuItemTable.innerHTML = "";

                data.forEach(menuItem => {
                    const tr = document.createElement("tr");

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

                    const updateTd = document.createElement("td");
                    const updateBtn = document.createElement("button");
                    updateBtn.textContent = "Update";
                    updateBtn.addEventListener("click", () => {
                        // Remove existing edit row if any
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

                        document.getElementById(`cancel-${menuItem._id}`).addEventListener("click", () => {
                            editRow.remove();
                            updateBtn.disabled = false;
                        });

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

                                formFeedback("Updated successfully!", false);
                                    location.reload();
                            } catch (err) {
                                console.error("Update error:", err);
                                alert("An error occurred while updating.");
                            }
                        });
                    });
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
                                        tr.remove();
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
    const category = document.getElementById("item-category").value.trim();
    const ingredientsRaw = document.getElementById("item-ingredients").value.trim();
    const price = parseFloat(document.getElementById("item-price").value);
    const veganAlternative = document.getElementById("item-vegan").checked;

    const ingredients = ingredientsRaw.split(",").map(i => i.trim()).filter(i => i.length > 0);

    const newItem = { name, category, ingredients, price, vegan_alternative: veganAlternative };

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
        e.target.reset();
        location.reload();
    } catch (err) {
        console.error("Add item error:", err);
        formFeedback("An unexpected error occurred. Please try again.", true);
    }
});

// Logout
document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "index.html";
});