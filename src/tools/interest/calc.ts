export interface InterestResult {
  totalAmount: number
  interestEarned: number
}

export function simpleInterest(principal: number, rate: number, years: number): InterestResult {
  const interestEarned = principal * (rate / 100) * years
  return {
    interestEarned,
    totalAmount: principal + interestEarned,
  }
}

// compoundsPerYear: 1 = annually, 2 = semiannually, 4 = quarterly, 12 = monthly, 365 = daily
export function compoundInterest(
  principal: number,
  rate: number,
  years: number,
  compoundsPerYear: number
): InterestResult {
  const totalAmount = principal * Math.pow(1 + rate / 100 / compoundsPerYear, compoundsPerYear * years)
  return {
    totalAmount,
    interestEarned: totalAmount - principal,
  }
}
