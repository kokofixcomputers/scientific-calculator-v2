interface Props {
  label: string
  onClick: () => void
  wide?: boolean
  className?: string
}

export default function Key({ label, onClick, wide, className }: Props) {
  return (
    <button
      type="button"
      tabIndex={-1}
      className={`btn-secondary rounded-full px-4 py-3 select-none ${
        wide ? "col-span-2" : ""
      } ${className ?? ""}`}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
