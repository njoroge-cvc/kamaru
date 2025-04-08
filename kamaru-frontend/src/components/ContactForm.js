import React, { useState } from "react";
import { sendContactMessage } from "../api";

const ContactForm = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    setIsSubmitting(true);

    try {
      await sendContactMessage(formData);
      setMessage({ text: "Message sent successfully!", type: "success" });
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      setMessage({ text: "Failed to send message. Please try again.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-9 rounded-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name and Email Fields */}
        <div className="md:flex md:gap-4">
          <label className="block md:w-1/2">
            <span className="text-[#8F3B1B] font-semibold">Your Name</span>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-[#D57500] rounded-md focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
            />
          </label>

          <label className="block md:w-1/2">
            <span className="text-[#8F3B1B] font-semibold">Your Email</span>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-[#D57500] rounded-md focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
            />
          </label>
        </div>

        {/* Message Field */}
        <label className="block">
          <span className="text-[#8F3B1B] font-semibold">Your Message</span>
          <textarea
            name="message"
            placeholder="Type your message here"
            value={formData.message}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-[#D57500] rounded-md focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
          ></textarea>
        </label>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 rounded-md text-sm transition duration-300 text-white ${
            isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#D57500] hover:bg-[#8F3B1B]"
          }`}
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </button>
      </form>

      {/* Success/Error Message */}
      {message.text && (
        <p className={`text-center mt-4 ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
};

export default ContactForm;