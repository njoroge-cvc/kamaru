from flask import Blueprint, request, jsonify
from app.utils.email_service import send_email

bp = Blueprint("contact_routes", __name__)

# --------------------------------------------------------
# Contact Us Route
# --------------------------------------------------------

@bp.route("/contact", methods=["POST"])
def contact_us():

    data = request.get_json(silent=True)

    if data is None:
        return jsonify({
            "error": "Request body is required"
        }), 400
    
    if not data:
        return jsonify({
            "error": "Empty request body is not allowed"
        }), 400


    name = data.get("name")
    email = data.get("email")
    message = data.get("message")

    # Validation
    if not name or not email or not message:
        return jsonify({"error": "All fields are required"}), 400

    # Prepare email
    subject = "New Contact Form Submission | Kamaru Challenge"

    content = f"""
    <div style="
        font-family: Arial, sans-serif;
        max-width: 650px;
        margin: 0 auto;
        border: 1px solid #e5e5e5;
        border-radius: 8px;
        overflow: hidden;
    ">

        <!-- Header -->
        <div style="
            background-color: #D57500;
            padding: 20px;
            text-align: center;
            color: white;
        ">
            <h2 style="margin:0;">
                Kamaru Challenge
            </h2>
            <p style="margin:8px 0 0 0;">
                New Website Contact Message
            </p>
        </div>

        <!-- Body -->
        <div style="padding: 30px;">

            <p>
                You have received a new message through the
                <strong>Kamaru Challenge</strong> website contact form.
            </p>

            <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">

            <p>
                <strong>Name:</strong><br>
                {name}
            </p>

            <p>
                <strong>Email:</strong><br>
                <a href="mailto:{email}">
                    {email}
                </a>
            </p>

            <p>
                <strong>Message:</strong>
            </p>

            <div style="
                background:#f8f8f8;
                padding:15px;
                border-left:4px solid #D57500;
                border-radius:4px;
            ">
                {message}
            </div>

        </div>

        <!-- Footer -->
        <div style="
            background:#fafafa;
            padding:20px;
            text-align:center;
            font-size:12px;
            color:#666;
        ">
            This message was submitted via the Kamaru Challenge website.<br>
            https://kamaruchallenge.africa
        </div>

    </div>
    """

    success = send_email(
        "info@kamaruchallenge.africa",
        subject,
        content
    )

    if not success:
        return jsonify({
            "error": "Failed to send your message. Please try again later."
        }), 500
    
    return jsonify({
        "message": "Message sent successfully! Getting back to you ASAP"
    }), 200
