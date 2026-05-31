import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { verifyNewsletter } from "../api"; // Import the API function to verify the newsletter subscription

function VerifyNewsletter() {

  const [message, setMessage] =
    useState("Verifying...");

  const [searchParams] =
    useSearchParams();

  useEffect(() => {

    const token =
      searchParams.get("token");

    if (!token) {
      setMessage(
        "Invalid verification link."
      );
      return;
    }

    verifyNewsletter(token)
      .then((response) => {
        setMessage(
          response.data.message ||
          "Verification successful"
        );
      })
      .catch(() => {
        setMessage(
          "Verification failed"
        );
      });

  }, [searchParams]);

  return (
    <div className="p-10 text-center">
      <h2>{message}</h2>
    </div>
  );
}

export default VerifyNewsletter;