import React from "react";
import { Link } from "react-router-dom";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-white p-6">
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-600 mb-6">
        <Link to="/" className="hover:underline">
          Home
        </Link>{" "}
        / <span className="text-gray-800">About Us</span>
      </nav>

      <h1 className="text-4xl font-bold text-[#333] text-center mb-6">About Us</h1>

      {/* Our History */}
      <section className="md:flex gap-6 items-center mb-12">
        <div className="md:w-1/2">
          <h2 className="text-3xl font-bold text-[#333] mb-4">Our History</h2>
          <p className="font-bold text-gray-700 mb-2">
            Understanding our past helps us shape a better future.
          </p>
          <p className="text-gray-700">
            We believe that Africans have grown indifferent towards the unique values that established them as a dignified and happy community. 
            That indifference was hastened by the negative effects of false colonial ideologies that made many perceive their culture as uncivilized 
            and one to be ashamed of. To be “civilized,” one was expected to cut themselves off from their cultural past.
          </p>
        </div>
        <div className="md:w-1/2">
          <img
            src="https://via.placeholder.com/600x400" // Replace with actual image URL
            alt="Our History"
            className="rounded-lg w-full h-auto object-cover"
          />
        </div>
      </section>

      {/* Our Values */}
      <section className="md:flex gap-6 items-center mb-12">
        <div className="md:w-1/2 order-2 md:order-1">
          <img
            src="https://via.placeholder.com/600x400" // Replace with actual image URL
            alt="Our Values"
            className="rounded-lg w-full h-auto object-cover"
          />
        </div>
        <div className="md:w-1/2 order-1 md:order-2">
          <h2 className="text-3xl font-bold text-[#333] mb-4">Our Values</h2>
          <p className="font-bold text-gray-700 mb-2">
            Timeless values are the foundation of a thriving community.
          </p>
          <p className="text-gray-700">
            Postcolonial self-legitimation ideologies by African elites promoted material wealth and adoption of the colonizers' education and culture 
            as the hallmarks of a good leader rather than the culturally inculcated timeless values of Communality, Reverence, Justice, Courage, 
            Diligence, Introspection, and Self-control. Indifference to these values is destroying the community with many fault lines visible in 
            broken families, alcoholism, and disengagement from family and community by the youth - especially men.
          </p>
        </div>
      </section>

      {/* Our Mission */}
      <section className="md:flex gap-6 items-center">
        <div className="md:w-1/2">
          <h2 className="text-3xl font-bold text-[#333] mb-4">Our Mission</h2>
          <p className="font-bold text-gray-700 mb-2">
            Reconnecting with our identity to thrive together as a community.
          </p>
          <p className="text-gray-700">
            We have purposed to do our part to help the community rediscover and reconnect with their identity by fanning the flames of the cultural 
            values so that we may together thrive again. We have dedicated our two spaces in Nguirubi in Ndeiya to help achieve this purpose: 
            <strong> Irīma-ini kwa Wanjiku</strong> and <strong>Rediscovery Garden</strong>. These spaces are open for community healing activities 
            through sharing of authentic knowledge and experiences that encourage the living out of those values in every facet of our lives.
          </p>
        </div>
        <div className="md:w-1/2">
          <img
            src="https://via.placeholder.com/600x400" // Replace with actual image URL
            alt="Our Mission"
            className="rounded-lg w-full h-auto object-cover"
          />
        </div>
      </section>
    </div>
  );
};

export default AboutUs;