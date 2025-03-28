import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from flask import current_app

def send_email(to_email, subject, content):
    """Send an email using Brevo (Sendinblue) API."""
    try:
        configuration = sib_api_v3_sdk.Configuration()
        configuration.api_key['api-key'] = current_app.config.get("BREVO_API_KEY")

        api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))
        sender = {"email": current_app.config.get("BREVO_SENDER_EMAIL"), "name": "Your App Name"}
        recipient = [{"email": to_email}]

        email = {
            "sender": sender,
            "to": recipient,
            "subject": subject,
            "htmlContent": content,
        }

        api_instance.send_transac_email(email)
        return True
    except ApiException as e:
        print(f"Error sending email: {e}")
        return False