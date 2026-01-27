interface FractionDisplayProps {
  result: string
}

export default function FractionDisplay({ result }: FractionDisplayProps) {
  if (result === "—") {
    return <div className="text-center">{result}</div>
  }

  // Handle mixed numbers (e.g., "2 3/4")
  if (result.includes(" ") && result.includes("/")) {
    const parts = result.split(" ")
    const whole = parts[0]
    const [numerator, denominator] = parts[1].split("/")
    
    return (
      <div className="flex items-center justify-center gap-2">
        <span className="text-2xl">{whole}</span>
        <div className="flex flex-col items-center">
          <span className="text-sm leading-none">{numerator}</span>
          <div className="border-t border-current w-6"></div>
          <span className="text-sm leading-none">{denominator}</span>
        </div>
      </div>
    )
  }

  // Handle regular fractions (e.g., "3/4")
  if (result.includes("/")) {
    const [numerator, denominator] = result.split("/")
    
    return (
      <div className="flex flex-col items-center">
        <span className="text-lg leading-none">{numerator}</span>
        <div className="border-t border-current w-8"></div>
        <span className="text-lg leading-none">{denominator}</span>
      </div>
    )
  }

  // Handle regular numbers, decimals, percentages
  return <div className="text-center">{result}</div>
}