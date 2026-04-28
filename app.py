from flask import Flask, render_template, request, redirect, session, jsonify
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = "secret123"


# --- DB CONNECTION ---
def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="retro_collection"
    )


# --- HOME ---
@app.route("/")
def home():
    if "user_id" not in session:
        return redirect("/login")

    return render_template("index.html")


# --- ABOUT ---
@app.route("/about")
def about():
    return render_template("about.html")


# --- REGISTER ---
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form["username"]
        email = request.form["email"]
        password = generate_password_hash(request.form["password"])

        db = get_db()
        cursor = db.cursor()

        cursor.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)",
            (username, email, password)
        )

        db.commit()
        cursor.close()
        db.close()

        return redirect("/login")

    return render_template("register.html")


# --- LOGIN ---
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        db = get_db()
        cursor = db.cursor(dictionary=True)

        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()

        cursor.close()
        db.close()

        if user and check_password_hash(user["password_hash"], password):
            session["user_id"] = user["user_id"]
            return redirect("/")

        return "Invalid login"

    return render_template("login.html")


# --- LOGOUT ---
@app.route("/logout")
def logout():
    session.clear()
    return redirect("/login")


# --- GET GAMES WITH FILTERING AND SORTING ---
@app.route("/api/games")
def get_games():
    if "user_id" not in session:
        return jsonify([])

    completed = request.args.get("completed")
    console = request.args.get("console")
    sort = request.args.get("sort", "title")
    order = request.args.get("order", "asc")

    query = """
        SELECT games.game_id, games.title, games.release_year,
               games.completed, consoles.console_name
        FROM games
        JOIN consoles ON games.console_id = consoles.console_id
        WHERE games.user_id = %s
    """

    params = [session["user_id"]]

    if completed == "1":
        query += " AND games.completed = TRUE"
    elif completed == "0":
        query += " AND games.completed = FALSE"

    if console:
        query += " AND consoles.console_name = %s"
        params.append(console)

    sort_columns = {
        "title": "games.title",
        "console": "consoles.console_name",
        "year": "games.release_year"
    }

    sort_column = sort_columns.get(sort, "games.title")
    sort_order = "DESC" if order == "desc" else "ASC"

    query += f" ORDER BY {sort_column} {sort_order}"

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute(query, params)
    games = cursor.fetchall()

    cursor.close()
    db.close()

    return jsonify(games)


# --- ADD GAME ---
@app.route("/api/games", methods=["POST"])
def add_game():
    if "user_id" not in session:
        return {"status": "not logged in"}, 401

    data = request.json

    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        "SELECT console_id FROM consoles WHERE console_name = %s",
        (data["console"],)
    )

    console_id = cursor.fetchone()[0]

    cursor.execute("""
        INSERT INTO games (user_id, console_id, title, release_year, completed)
        VALUES (%s, %s, %s, %s, %s)
    """, (
        session["user_id"],
        console_id,
        data["title"],
        data["year"],
        data["completed"]
    ))

    db.commit()

    cursor.close()
    db.close()

    return {"status": "ok"}


# --- DELETE GAME ---
@app.route("/api/games/<int:game_id>", methods=["DELETE"])
def delete_game(game_id):
    if "user_id" not in session:
        return {"status": "not logged in"}, 401

    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        "DELETE FROM games WHERE game_id = %s AND user_id = %s",
        (game_id, session["user_id"])
    )

    db.commit()

    cursor.close()
    db.close()

    return {"status": "deleted"}


# --- TOGGLE COMPLETED ---
@app.route("/api/games/<int:game_id>/toggle", methods=["PUT"])
def toggle_completed(game_id):
    if "user_id" not in session:
        return {"status": "not logged in"}, 401

    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
        UPDATE games
        SET completed = NOT completed
        WHERE game_id = %s AND user_id = %s
    """, (game_id, session["user_id"]))

    db.commit()

    cursor.close()
    db.close()

    return {"status": "updated"}


if __name__ == "__main__":
    app.run(debug=True)