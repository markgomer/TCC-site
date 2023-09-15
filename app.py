from flask import Flask, render_template, request, redirect, url_for, flash, session
import os

app = Flask(__name__)
app.secret_key = "mysecretkey"  # for flash messaging and session

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Dummy data: Normally, you'd use a database
users = {"username": "password"}

@app.route("/")
def home():
    if "username" in session:
        files = os.listdir(UPLOAD_FOLDER)
        return render_template("upload.html", files=files)
    return render_template("index.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        if username in users and users[username] == password:
            session["username"] = username
            flash("Login successful!", "success")
            return redirect(url_for("home"))
        else:
            flash("Invalid credentials. Try again.", "danger")
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload_file():
    if "username" not in session:
        flash("You need to be logged in to upload files.", "danger")
        return redirect(url_for("home"))

    if "file" not in request.files:
        flash("No file part", "danger")
        return redirect(request.url)
    uploaded_file = request.files["file"]

    if uploaded_file.filename == "":
        flash("No file selected", "danger")
        return redirect(request.url)
    
    if uploaded_file:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], uploaded_file.filename)
        uploaded_file.save(file_path)
        flash(f"File {uploaded_file.filename} uploaded successfully!", "success")

    return redirect(url_for("home"))


@app.route("/signout")
def signout():
    session.pop("username", None)
    flash("You have been signed out", "info")
    return redirect(url_for("home"))


if __name__ == "__main__":
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    app.run(debug=True)
