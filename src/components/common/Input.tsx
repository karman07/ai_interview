import * as React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input: React.FC<InputProps> = (props) => {
  return (
    <input
      {...props}
      className={`border rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none ${props.className ?? ""}`}
    />
  );
};

export default Input; 