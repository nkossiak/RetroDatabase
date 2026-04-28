const gameForm = document.getElementById("gameForm");
const titleInput = document.getElementById("title");
const consoleInput = document.getElementById("console");
const yearInput = document.getElementById("year");
const completedInput = document.getElementById("completed");
const gameTableBody = document.getElementById("gameTableBody");

const completionFilter = document.getElementById("completionFilter");
let currentSort = "title";
let currentOrder = "asc";

document.addEventListener("DOMContentLoaded", function () {
    loadGames();
});

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

async function loadGames() {
    const params = new URLSearchParams();

    if (completionFilter.value) {
        params.append("completed", completionFilter.value);
    }

    params.append("sort", currentSort);
    params.append("order", currentOrder);

    const response = await fetch(`/api/games?${params.toString()}`);
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
                ${completed === "Yes" ? "" : ""}
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

completionFilter.addEventListener("change", loadGames);
document.querySelectorAll(".sortable").forEach(function (header) {
    header.addEventListener("click", function () {
        const selectedSort = header.dataset.sort;

        if (currentSort === selectedSort) {
            if (currentOrder === "asc") {
                currentOrder = "desc";
            } else {
                currentOrder = "asc";
            }
        } else {
            currentSort = selectedSort;
            currentOrder = "asc";
        }

        document.querySelectorAll(".sortable").forEach(function (h) {
            h.classList.remove("active-sort", "pressed");
        });

        header.classList.add("active-sort", "pressed");

        setTimeout(function () {
            header.classList.remove("pressed");
        }, 120);

        loadGames();
    });
});