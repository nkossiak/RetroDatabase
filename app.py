from flask import Flask, render_template, request, redirect, session, jsonify
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = "secret123"  # for sessions

# --- DB CONNECTION ---
def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",  # default XAMPP
        database="retro_collection"
    )

# --- HOME ---
@app.route("/")
def home():
    if "user_id" not in session:
        return redirect("/login")
    return render_template("index.html")

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

        cursor.execute("SELECT * FROM users WHERE username=%s", (username,))
        user = cursor.fetchone()

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

# --- GET GAMES ---
@app.route("/api/games")
def get_games():
    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT games.game_id, games.title, games.release_year, games.completed, consoles.console_name
        FROM games
        JOIN consoles ON games.console_id = consoles.console_id
        WHERE user_id = %s
    """, (session["user_id"],))

    return jsonify(cursor.fetchall())

# --- ADD GAME ---
@app.route("/api/games", methods=["POST"])
def add_game():
    data = request.json

    db = get_db()
    cursor = db.cursor()

    # get console_id
    cursor.execute("SELECT console_id FROM consoles WHERE console_name=%s", (data["console"],))
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
    return {"status": "ok"}

if __name__ == "__main__":
    app.run(debug=True)