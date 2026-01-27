interface Props {
  previous: string
  current: string
}

export default function Display({ previous, current }: Props) {
  return (
    <div className="glass rounded-xl p-6 text-right font-mono select-none">
      <div className="text-sm text-[rgb(var(--muted))] min-h-[1.2em]">
        {previous}
      </div>
      <div className="text-3xl">
        {current}
      </div>
    </div>
  )
}
