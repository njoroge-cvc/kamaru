import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from flask import current_app

# This module provides a function to send emails using the Brevo (Sendinblue) API.
def send_email(to_email, subject, content):
    """Send an email using Brevo (Sendinblue) API."""
    try:
        # Set up the API client with the API key from the Flask app configuration
        configuration = sib_api_v3_sdk.Configuration()
        configuration.api_key['api-key'] = current_app.config.get("BREVO_API_KEY")

        # Create an instance of the API class and set up the email parameters
        api_instance = sib_api_v3_sdk.TransactionalEmailsApi(
            # Create an API client with the configuration
            sib_api_v3_sdk.ApiClient(
                configuration
            )
        )

        # Define the sender and recipient information, as well as the email content
        sender = {
            "email": current_app.config.get("BREVO_SENDER_EMAIL"), 
            "name": "Your App Name"
        }

        # Define the recipient as a list of dictionaries, each containing an email address
        recipient = [{
            "email": to_email
        }]

        # Construct the email payload with the sender, recipient, subject, and HTML content
        email = {
            "sender": sender,
            "to": recipient,
            "subject": subject,
            "htmlContent": content,
        }

        api_instance.send_transac_email(email)
        return True
    
    # Handle any exceptions that occur during the API call and print an error message
    except ApiException as e:
        print(f"Error sending email: {e}")
        return False