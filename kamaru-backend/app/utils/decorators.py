from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from app.models.user import User # Import the User model from app.models.user module to access the User class

def admin_required(f): # Decorator function that takes a function as an argument and returns a new function that checks if the user is an admin
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_admin:
            return jsonify({"error": "Admin access required"}), 403
        
        return f(*args, **kwargs)
    
    return decorated_function
