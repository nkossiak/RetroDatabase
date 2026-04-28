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
        <td class="title-cell">${title}</td>
        <td class="console-cell">${consoleName}</td>
        <td class="year-cell">${year}</td>

        <td class="completed-cell">
            <button class="pixel-status ${completed === "Yes" ? "done" : "not-done"} toggle-completed-btn"
                    type="button"
                    data-id="${gameId}">
            </button>
        </td>

        <td class="delete-cell">
            <button class="edit-btn" type="button" data-id="${gameId}">✎</button>
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
    const editBtn = event.target.closest(".edit-btn");
    const saveBtn = event.target.closest(".save-edit-btn");
    const cancelBtn = event.target.closest(".cancel-edit-btn");

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
        return;
    }

    if (editBtn) {
        const row = editBtn.closest("tr");
        enterEditMode(row, editBtn.dataset.id);
        return;
    }

    if (saveBtn) {
        const row = saveBtn.closest("tr");
        const gameId = saveBtn.dataset.id;

        const title = row.querySelector(".edit-title").value.trim();
        const consoleName = row.querySelector(".edit-console").value;
        const year = row.querySelector(".edit-year").value.trim() || null;
        const completed = row.querySelector(".toggle-completed-btn").classList.contains("done");

        if (title === "") {
            alert("Please enter a game title.");
            return;
        }

        await fetch(`/api/games/${gameId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                console: consoleName,
                year: year,
                completed: completed
            })
        });

        loadGames();
        return;
    }

    if (cancelBtn) {
        loadGames();
    }
});

function enterEditMode(row, gameId) {
    const title = row.querySelector(".title-cell").textContent;
    const consoleName = row.querySelector(".console-cell").textContent;
    const year = row.querySelector(".year-cell").textContent;

    row.querySelector(".title-cell").innerHTML = `
        <input class="edit-input edit-title" type="text" value="${title}">
    `;

    row.querySelector(".console-cell").innerHTML = `
        <select class="edit-input edit-console">
            <option value="NES" ${consoleName === "NES" ? "selected" : ""}>NES</option>
            <option value="SNES" ${consoleName === "SNES" ? "selected" : ""}>SNES</option>
        </select>
    `;

    row.querySelector(".year-cell").innerHTML = `
        <input class="edit-input edit-year" type="number" value="${year === "N/A" ? "" : year}">
    `;

    row.querySelector(".edit-btn").outerHTML = `
        <button class="save-edit-btn" type="button" data-id="${gameId}">✓</button>
    `;

    row.querySelector(".remove-row-btn").outerHTML = `
        <button class="cancel-edit-btn" type="button">✕</button>
    `;
}

completionFilter.addEventListener("change", loadGames);

document.querySelectorAll(".sortable").forEach(function (header) {
    header.addEventListener("click", function () {
        const selectedSort = header.dataset.sort;

        if (currentSort === selectedSort) {
            currentOrder = currentOrder === "asc" ? "desc" : "asc";
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