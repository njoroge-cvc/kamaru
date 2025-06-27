import React from "react";

const TermsAndConditionsPage = () => {
  return (
    <div className="container mx-auto px-4 py-12 text-gray-800">
      <h1 className="text-4xl font-bold text-[#D57500] mb-6">Terms & Conditions</h1>

      <p className="mb-6 text-lg">
        Welcome to the Kamaru Challenge platform. By accessing our website or attending our events, you agree to comply with and be bound by the following terms and conditions. Please read them carefully.
      </p>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-[#D57500] mb-4">1. Purpose and Values</h2>
        <p className="text-base mb-2">
          Kamaru Challenge is a community-driven initiative committed to exposing raw talent within the Kikuyu community. Our platform celebrates authenticity, moral integrity, diligence, self-control, and communality. We are not a for-profit organization and operate with the aim of inspiring transformative change through music, culture, and values.
        </p>
        <p className="text-base">
          The name “Kamaru” is used with the highest regard and in reference to the legendary musician Joseph Kamaru, whose work and character symbolize excellence, leadership, and societal transformation.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-[#D57500] mb-4">2. Media Use Disclaimer</h2>
        <p className="text-base mb-2">
          By participating in or attending any of our events, you consent to the capturing of photographs, videos, and audio recordings in which you may appear or be heard. These materials are the sole property of the Kamaru Challenge organization.
        </p>
        <p className="text-base">
          We reserve the right to use this media in any format for promotional, informational, archival, or other legitimate purposes — including but not limited to social media, our official website, and event-related publications — without seeking further permission or offering compensation.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-[#D57500] mb-4">3. Event Conduct & Participation</h2>
        <p className="text-base mb-2">
          All attendees and participants are expected to conduct themselves with respect, discipline, and responsibility. We reserve the right to remove any individual whose behavior is deemed disruptive, inappropriate, or harmful to others or the event’s mission.
        </p>
        <p className="text-base">
          Participants must submit accurate information during registration and adhere to event timelines and guidelines.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-[#D57500] mb-4">4. Intellectual Property</h2>
        <p className="text-base">
          All content on this site, including images, logos, videos, text, and graphics, is the property of Kamaru Challenge or its contributors. Reproduction, distribution, or unauthorized use is prohibited without written consent.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-[#D57500] mb-4">5. Changes to Terms</h2>
        <p className="text-base">
          We may update these terms from time to time. Continued use of this site or participation in events after changes have been posted constitutes acceptance of those changes.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-[#D57500] mb-4">6. Contact</h2>
        <p className="text-base">
          If you have questions regarding these Terms & Conditions, please contact us through the details provided on our website.
        </p>
      </section>
    </div>
  );
};

export default TermsAndConditionsPage;
