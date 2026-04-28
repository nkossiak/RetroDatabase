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
        <td class="completed-cell">
            <button class="pixel-status ${completed === "Yes" ? "done" : "not-done"} toggle-completed-btn" 
                    type="button" 
                    data-id="${gameId}">
                ${completed === "Yes" ? "ON" : "OFF"}
            </button>
        </td>
        <td class="delete-cell">
            <button class="trash-btn remove-row-btn" type="button" data-id="${gameId}" title="Remove">
                🗑
            </button>
        </td>
    `;

    gameTableBody.appendChild(row);
}

// Handle menu, delete, and toggle completed buttons
gameTableBody.addEventListener("click", async function (event) {
    const removeBtn = event.target.closest(".remove-row-btn");
    const toggleBtn = event.target.closest(".toggle-completed-btn");

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