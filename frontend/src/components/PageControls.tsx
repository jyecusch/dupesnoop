import { ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/20/solid'
import Button from "./Button";

interface PageControlsProps {
  page: number;
  onPageChange: (page: number) => void;
  totalPages: number;
  // base sets whether the numbers start at 0 or 1, if they start at zero the displayed number will be page + 1
  base?: 0 | 1;
}

export default function PageControls({
  onPageChange,
  page,
  totalPages,
  base = 0,
}: PageControlsProps) {
  const displayPage = base === 0 ? page + 1 : page;
  const displayTotal = base === 0 ? totalPages + 1 : totalPages;

  return (
    <>
      <Button
        disabled={page <= 0}
        variant='link'
        onClick={() => {
          onPageChange(page - 1);
        }}
      >
        <ArrowLeftIcon aria-hidden="true" className="h-5 w-5" />
      </Button>
      {/* TODO: Add total pages to backend */}
      <span className="grid content-center mx-2">
        Page {displayPage} of {displayTotal}
      </span>
      <Button
        disabled={page >= totalPages}
        variant='link'
        onClick={() => {
          onPageChange(page + 1);
        }}
      >
        <ArrowRightIcon aria-hidden="true" className="h-5 w-5" />
      </Button>
    </>
  );
}
