interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "link";
}

const variants = {
  primary: "inline-flex items-center relative -ml-px gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:text-gray-400 disabled:hover:bg-transparent",
  secondary: "bg-gray-200 text-gray-900 inline-flex items-center relative -ml-px gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:text-gray-400 disabled:hover:bg-transparent",
  link: "text-indigo-600 disabled:text-gray-400 disabled:hover:bg-transparent",
};

export default function Button({ children, onClick, variant, disabled }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={variants[variant || "primary"]}
    >
      {children}
    </button>
  );
}
