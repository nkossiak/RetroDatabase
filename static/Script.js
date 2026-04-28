const gameForm = document.getElementById("gameForm");
const titleInput = document.getElementById("title");
const consoleInput = document.getElementById("console");
const yearInput = document.getElementById("year");
const completedInput = document.getElementById("completed");
const gameTableBody = document.getElementById("gameTableBody");

// Load games from the database when the page first opens
document.addEventListener("DOMContentLoaded", function () {
    loadGames();
});

// Add a new game
gameForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const title = titleInput.value.trim();

    if (title === "") {
        alert("Please enter a game title.");
        return;
    }

    const gameData = {
        title: title,
        console: consoleInput.value,
        year: yearInput.value.trim() || null,
        completed: completedInput.checked
    };

    await fetch("/api/games", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(gameData)
    });

    gameForm.reset();
    loadGames();
});

// Get all games for the logged-in user
async function loadGames() {
    const response = await fetch("/api/games");
    const games = await response.json();

    gameTableBody.innerHTML = "";

    games.forEach(function (game) {
        addGameRow(
            game.game_id,
            game.title,
            game.console_name,
            game.release_year || "N/A",
            game.completed ? "Yes" : "No"
        );
    });
}

// Display one game row in the table
function addGameRow(gameId, title, consoleName, year, completed) {
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${title}</td>
        <td>${consoleName}</td>
        <td>${year}</td>
        <td class="completed-cell">${completed}</td>
        <td class="menu-cell">
            <button class="menu-btn" type="button">&hellip;</button>
            <div class="dropdown-menu">
                <button class="dropdown-item toggle-completed-btn" type="button" data-id="${gameId}" title="Toggle Completed">
                    ✓
                </button>
                <button class="dropdown-item remove-row-btn" type="button" data-id="${gameId}" title="Remove">
                    🗑
                </button>
            </div>
        </td>
    `;

    gameTableBody.appendChild(row);
}

// Handle menu, delete, and toggle completed buttons
gameTableBody.addEventListener("click", async function (event) {
    const menuBtn = event.target.closest(".menu-btn");
    const removeBtn = event.target.closest(".remove-row-btn");
    const toggleBtn = event.target.closest(".toggle-completed-btn");

    if (menuBtn) {
        const row = menuBtn.closest("tr");
        const menu = row.querySelector(".dropdown-menu");

        document.querySelectorAll(".dropdown-menu.show").forEach(function (m) {
            if (m !== menu) {
                m.classList.remove("show");
            }
        });

        menu.classList.toggle("show");
        return;
    }

    if (removeBtn) {
        const gameId = removeBtn.dataset.id;

        await fetch(`/api/games/${gameId}`, {
            method: "DELETE"
        });

        loadGames();
        return;
    }

    if (toggleBtn) {
        const gameId = toggleBtn.dataset.id;

        await fetch(`/api/games/${gameId}/toggle`, {
            method: "PUT"
        });

        loadGames();
    }
});

// Close dropdown menu when clicking outside
document.addEventListener("click", function (event) {
    if (!event.target.closest(".menu-cell")) {
        document.querySelectorAll(".dropdown-menu.show").forEach(function (menu) {
            menu.classList.remove("show");
        });
    }
});