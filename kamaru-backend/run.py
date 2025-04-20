import os
from flask import send_from_directory
# Import the Flask app instance from the app module
from app import app  

# Define the root route
@app.route("/")
def home():
    return {"message": "Welcome to Kamaru Backend API"}

@app.route("/favicon.ico")
def favicon():
    """Serve the favicon."""
    print("ROOT PATH:", app.root_path)

    return send_from_directory(
        os.path.join(app.root_path, "static"), "favicon.ico", mimetype="image/vnd.microsoft.icon"
        )

# Ensure the script runs only when executed directly
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True, threaded=True)
