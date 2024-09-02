interface CheckboxProps {
  id: string;
  name: string;
  ariaDescribedby?: string;
  className?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  checked?: boolean;
  disabled?: boolean;
}

function Checkbox({ id, name, ariaDescribedby, className, onChange, checked = false, disabled }: CheckboxProps) {
  return (
    <input
      id={id}
      name={name}
      disabled={disabled}
      type="checkbox"
      aria-describedby={ariaDescribedby}
      onChange={onChange}
      checked={checked}
      className={`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 ${className}`}
    />
  );
}

export default Checkbox;
