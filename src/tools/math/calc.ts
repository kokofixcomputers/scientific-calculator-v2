export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b)
}

export function lcmMultiple(numbers: number[]): number {
  return numbers.reduce((acc, num) => lcm(acc, num))
}

export function gcfMultiple(numbers: number[]): number {
  return numbers.reduce((acc, num) => gcd(acc, num))
}

export function primeFactorization(n: number): number[] {
  const factors: number[] = []
  let num = n
  
  for (let i = 2; i * i <= num; i++) {
    while (num % i === 0) {
      factors.push(i)
      num /= i
    }
  }
  
  if (num > 1) factors.push(num)
  return factors
}

export function listFactors(n: number): number[] {
  const factors: number[] = []
  for (let i = 1; i <= Math.sqrt(n); i++) {
    if (n % i === 0) {
      factors.push(i)
      if (i !== n / i) factors.push(n / i)
    }
  }
  return factors.sort((a, b) => a - b)
}

export function isPrime(n: number): boolean {
  if (n < 2) return false
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false
  }
  return true
}

export function findPrimes(limit: number): number[] {
  const primes: number[] = []
  for (let i = 2; i <= limit; i++) {
    if (isPrime(i)) primes.push(i)
  }
  return primes
}