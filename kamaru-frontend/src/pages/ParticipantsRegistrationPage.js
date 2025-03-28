import React from "react";
import ParticipantsRegistrationForm from "../components/ParticipantsRegistrationForm";

const ParticipantsRegistrationPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center text-[#8F3B1B]">
          Register to Participate
        </h1>
        <p className="text-[#8F3B1B] text-sm text-center mt-2">
          Be part of the <strong>KAMARU CHALLENGE – NDEIYA EDITION</strong>.  
          Register below and choose your category to participate!
        </p>

        <div className="mt-6">
          <ParticipantsRegistrationForm />
        </div>
      </div>
    </div>
  );
};

export default ParticipantsRegistrationPage;