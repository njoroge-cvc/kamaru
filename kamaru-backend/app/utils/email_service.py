import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from flask import current_app

# This module provides a function to send emails using the Brevo (Sendinblue) API.
def send_email(to_email, subject, content):
    try:
        # Set up the API client with the API key from the Flask app configuration
        configuration = sib_api_v3_sdk.Configuration()

        configuration.api_key['api-key'] = (
            current_app.config.get(
                "BREVO_API_KEY"
            )
        )

        # Create an instance of the API class and set up the email parameters
        api_instance = (
            sib_api_v3_sdk.TransactionalEmailsApi(
                # Create an API client with the configuration
                sib_api_v3_sdk.ApiClient(
                    configuration
                )
            )
        )

        sender = {
            "email": current_app.config.get(
                "BREVO_SENDER_EMAIL"
            ), 
            "name": "Kamaru Challenge"
        }

        # Define the recipient as a list of dictionaries, each containing an email address
        recipient = [{
            "email": to_email
        }]

        # Construct the email payload using the SendSmtpEmail class, 
        # including sender, recipient, subject, and HTML content
        send_smtp_email = (
            sib_api_v3_sdk.SendSmtpEmail(
                sender=sender,
                to=recipient,
                subject=subject,
                html_content=content
            )
        )
        # Send the email using the API instance and the constructed email payload
        response = (
            api_instance.send_transac_email(
                send_smtp_email
            )
        )

        print(
            f"Brevo email sent successfully: {response}"
        )

        return True
    
    # Handle any exceptions that occur during the API call and print an error message
    except ApiException as e:
        print(
            f"Brevo API Error: {e}"
        )
        return False