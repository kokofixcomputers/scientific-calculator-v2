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
      className={`${
        className || "btn-secondary"
      } select-none ${
        wide ? "col-span-2" : ""
      }`}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
