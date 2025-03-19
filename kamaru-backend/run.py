from app import app  

# Define the root route
@app.route("/")
def home():
    return {"message": "Welcome to Kamaru Backend API"}

# Ensure the script runs only when executed directly
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
