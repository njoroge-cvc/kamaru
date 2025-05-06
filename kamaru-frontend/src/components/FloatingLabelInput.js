import React from "react";

const FloatingLabelInput = ({
  type = "text",
  id,
  name,
  value,
  onChange,
  label,
  required = false,
}) => {

    const hasValue = value && value.trim() !== "";
  return (
    <label htmlFor={id} className="relative block">
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder=" "
        required={required}
        className={`peer mt-1 w-full rounded-md border border-[#F4A261] bg-white px-3 py-2 text-sm text-[#333] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D57500] ${
            hasValue ? "filled" : ""
          }`}
      />
      <span
        className="absolute left-3 bg-white px-1 text-sm font-medium text-[#333] transition-all
                  peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                  peer-focus:-top-2 peer-focus:text-sm peer-focus:text-[#D57500]
                  peer-[.filled]:-top-2 peer-[.filled]:text-sm peer-[.filled]:text-[#333]"
      >
        {label}
      </span>
    </label>
  );
};

export default FloatingLabelInput;
