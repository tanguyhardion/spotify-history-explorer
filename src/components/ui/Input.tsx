import { forwardRef } from "react";
import type { BaseComponentProps } from "../../types";

interface InputProps extends BaseComponentProps {
  type?: "text" | "email" | "password" | "search";
  placeholder?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  "aria-label"?: string;
  "aria-describedby"?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    type = "text",
    placeholder,
    value,
    onChange,
    onKeyDown,
    disabled = false,
    className = "",
    ...props
  }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-3 py-2 
          border border-gray-600 rounded-md 
          bg-gray-700 text-gray-100 placeholder-gray-400 
          backdrop-blur text-sm
          focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
          ${className}
        `}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";