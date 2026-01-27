import { Copy, Check } from "lucide-react"
import { useState } from "react"

interface Props {
  value: string
  className?: string
}

export default function CopyButton({ value, className = "" }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (value === "—" || value === "Error") return
    
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`btn-secondary p-2 ${className}`}
      disabled={value === "—" || value === "Error"}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
    </button>
  )
}