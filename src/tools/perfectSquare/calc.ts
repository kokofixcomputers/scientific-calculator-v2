export function findPerfectSquares(num: number): { lower: number; lowerRoot: number; upper: number; upperRoot: number } | null {
  if (num < 0 || !isFinite(num)) return null

  const sqrt = Math.sqrt(num)
  
  if (Number.isInteger(sqrt)) {
    return {
      lower: num,
      lowerRoot: sqrt,
      upper: num,
      upperRoot: sqrt
    }
  }

  const lowerRoot = Math.floor(sqrt)
  const upperRoot = Math.ceil(sqrt)

  return {
    lower: lowerRoot * lowerRoot,
    lowerRoot,
    upper: upperRoot * upperRoot,
    upperRoot
  }
}
