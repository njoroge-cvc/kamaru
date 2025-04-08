import React from "react";
import { Link } from "react-router-dom";

const MediaCard = ({ title, link, children }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {children}
      <div className="p-4">
        <h3 className="font-semibold text-[#333] text-center">{title}</h3>
        <div className="flex justify-center mt-12">
          <Link
              to={link}
              className="flex items-center gap-2 bg-[#D57500] text-white px-6 py-2 rounded-md shadow-md hover:bg-[#333] transition duration-300"
            >
             <h3>More in Videos</h3>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
      </div>
    </div>
  );
};

export default MediaCard;