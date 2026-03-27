const gameForm = document.getElementById("gameForm");
const titleInput = document.getElementById("title");
const consoleInput = document.getElementById("console");
const yearInput = document.getElementById("year");
const completedInput = document.getElementById("completed");
const gameTableBody = document.getElementById("gameTableBody");

gameForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const consoleName = consoleInput.value;
    const year = yearInput.value.trim() || "N/A";
    const completed = completedInput.checked ? "Yes" : "No";

    if (title === "") {
        alert("Please enter a game title.");
        return;
    }

    addGameRow(title, consoleName, year, completed);
    gameForm.reset();
});

function addGameRow(title, consoleName, year, completed) {
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${title}</td>
        <td>${consoleName}</td>
        <td>${year}</td>
        <td class="completed-cell">${completed}</td>
        <td class="menu-cell">
            <button class="menu-btn" type="button">&hellip;</button>
            <div class="dropdown-menu">
                <button class="dropdown-item toggle-completed-btn" type="button" title="Toggle Completed">
                    ✓
                </button>
                <button class="dropdown-item remove-row-btn" type="button" title="Remove">
                    🗑
                </button>
            </div>
        </td>
    `;

    gameTableBody.appendChild(row);
}

gameTableBody.addEventListener("click", function (event) {
    const menuBtn = event.target.closest(".menu-btn");
    const removeBtn = event.target.closest(".remove-row-btn");
    const toggleBtn = event.target.closest(".toggle-completed-btn");

    // open/close menu
    if (menuBtn) {
        const row = menuBtn.closest("tr");
        const menu = row.querySelector(".dropdown-menu");

        // close other menus
        document.querySelectorAll(".dropdown-menu.show").forEach(m => {
            if (m !== menu) m.classList.remove("show");
        });

        menu.classList.toggle("show");
        return;
    }

    // remove row
    if (removeBtn) {
        const row = removeBtn.closest("tr");
        row.remove();
        return;
    }

    // toggle completed
    if (toggleBtn) {
        const row = toggleBtn.closest("tr");
        const completedCell = row.querySelector(".completed-cell");

        if (completedCell.textContent.trim() === "Yes") {
            completedCell.textContent = "No";
        } else {
            completedCell.textContent = "Yes";
        }

        row.querySelector(".dropdown-menu").classList.remove("show");
    }
});

// close menu when clicking outside
document.addEventListener("click", function (event) {
    if (!event.target.closest(".menu-cell")) {
        document.querySelectorAll(".dropdown-menu.show").forEach(menu => {
            menu.classList.remove("show");
        });
    }
});