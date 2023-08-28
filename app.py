from flask import Flask, render_template, request, redirect, url_for, flash, session

app = Flask(__name__)
app.secret_key = "mysecretkey"  # for flash messaging and session

# Dummy data: Normally, you'd use a database
users = {"username": "password"}

@app.route("/")
def home():
    if "username" in session:
        return render_template("upload.html")
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
        # Normally, you'd save the file here
        flash(f"File {uploaded_file.filename} uploaded successfully!", "success")

    return redirect(url_for("home"))

if __name__ == "__main__":
    app.run(debug=True)
