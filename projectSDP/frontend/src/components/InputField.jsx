import React from "react";
import { TextInput, Label } from "flowbite-react";

export default function InputField({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
}) {
  return (
    <div>
      {label && (
        <div className="mb-2 block">
          <Label htmlFor={name} value={label} />
        </div>
      )}
      <TextInput
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
      />
    </div>
  );
}
