import { Copy, Check } from "lucide-react"
import { useState, forwardRef } from "react"

interface Props {
  value: string
  className?: string
}

const CopyButton = forwardRef<HTMLButtonElement, Props>(
  ({ value, className = "" }, ref) => {
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
        ref={ref}
        onClick={handleCopy}
        className={`btn-secondary p-2 ${className}`}
        disabled={value === "—" || value === "Error"}
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    )
  }
)

export default CopyButton
