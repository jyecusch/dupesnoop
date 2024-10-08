import { MagnifyingGlassIcon, FolderIcon } from '@heroicons/react/20/solid'

interface InputProps {
  label: string;
  value?: string;
  onClick?: () => void;
}

export default function Input({ label, value = "", onClick }: InputProps) {
  return (
    <div>
      <label htmlFor="text" className="block text-sm font-medium leading-6 text-gray-900">
        {label}
      </label>
      <div className="mt-2 flex rounded-md shadow-sm">
        <div className="relative flex flex-grow items-stretch focus-within:z-10">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <FolderIcon aria-hidden="true" className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="text"
            name="text"
            type="text"
            placeholder=""
            disabled
            value={value}
            className="block w-full rounded-none rounded-l-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
        <button
          type="button"
          onClick={onClick}
          className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          <MagnifyingGlassIcon aria-hidden="true" className="-ml-0.5 h-5 w-5 text-gray-400" />
          Browse
        </button>
      </div>
    </div>
  );
}
