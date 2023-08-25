from flask import Flask, request, render_template
app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_log():
    file = request.files['file']
    # Here you can process and save the uploaded file
    return 'File uploaded successfully!'

if __name__ == '__main__':
    app.run()
