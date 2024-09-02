interface HeaderProps {
  title: string
}

export default function Header({ title }: HeaderProps) {
  return (
    <div className="md:flex md:items-center md:justify-between">
      <div className="min-w-0 flex-1">
        <h2 className="text-1xl drop-shadow text-gray-600 font-bold leading-7 sm:truncate sm:text-2xl sm:tracking-tight">
          {title}
        </h2>
      </div>
    </div>
  )
}