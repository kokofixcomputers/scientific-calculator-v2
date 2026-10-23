const PI = Math.PI

// Strips IEEE-754 float dust (e.g. 4.999999999999999) left over from sqrt/division chains
function cleanFloat(n: number): number {
  if (!Number.isFinite(n)) return n
  const rounded = Number(n.toPrecision(10))
  return rounded === 0 ? 0 : rounded
}

export interface ShapeResult {
  [key: string]: number
}

// --- Right Triangle: give any two of a, b, c (hypotenuse) and get the third, plus area/perimeter ---
export function rightTriangleSolve(a?: number, b?: number, c?: number): ShapeResult | { error: string } {
  const known = [a, b, c].filter(v => v !== undefined && !isNaN(v))
  if (known.length < 2) return { error: "Provide at least two sides" }

  let ra = a, rb = b, rc = c

  if (ra !== undefined && rb !== undefined && rc === undefined) {
    rc = Math.sqrt(ra * ra + rb * rb)
  } else if (ra !== undefined && rc !== undefined && rb === undefined) {
    if (rc <= ra) return { error: "The hypotenuse (c) must be longer than each leg" }
    rb = Math.sqrt(rc * rc - ra * ra)
  } else if (rb !== undefined && rc !== undefined && ra === undefined) {
    if (rc <= rb) return { error: "The hypotenuse (c) must be longer than each leg" }
    ra = Math.sqrt(rc * rc - rb * rb)
  } else if (ra !== undefined && rb !== undefined && rc !== undefined) {
    if (Math.abs(ra * ra + rb * rb - rc * rc) > 1e-6 * Math.max(1, rc * rc)) {
      return { error: "These three sides don't form a right triangle (a² + b² ≠ c²)" }
    }
  }

  return {
    a: cleanFloat(ra!),
    b: cleanFloat(rb!),
    c: cleanFloat(rc!),
    area: cleanFloat(0.5 * ra! * rb!),
    perimeter: cleanFloat(ra! + rb! + rc!),
  }
}

// --- Triangle from three side lengths (Heron's formula) ---
export function triangleBySides(a: number, b: number, c: number): ShapeResult | { error: string } {
  if (a + b <= c || a + c <= b || b + c <= a) {
    return { error: "These lengths don't form a valid triangle (each side must be less than the sum of the other two)" }
  }
  const s = (a + b + c) / 2
  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c))
  return { perimeter: cleanFloat(a + b + c), area: cleanFloat(area) }
}

// --- Triangle from base and height ---
export function triangleByBaseHeight(base: number, height: number): ShapeResult {
  return { area: cleanFloat(0.5 * base * height) }
}

// --- Circle: give any one of radius/diameter/circumference/area, get all four ---
export function circleSolve(known: { radius?: number; diameter?: number; circumference?: number; area?: number }): ShapeResult | { error: string } {
  let r: number
  if (known.radius !== undefined && !isNaN(known.radius)) r = known.radius
  else if (known.diameter !== undefined && !isNaN(known.diameter)) r = known.diameter / 2
  else if (known.circumference !== undefined && !isNaN(known.circumference)) r = known.circumference / (2 * PI)
  else if (known.area !== undefined && !isNaN(known.area)) r = Math.sqrt(known.area / PI)
  else return { error: "Provide radius, diameter, circumference, or area" }

  if (r < 0) return { error: "Value must be positive" }

  return {
    radius: cleanFloat(r),
    diameter: cleanFloat(2 * r),
    circumference: cleanFloat(2 * PI * r),
    area: cleanFloat(PI * r * r),
  }
}

// --- Rectangle ---
export function rectangleSolve(length: number, width: number): ShapeResult {
  return {
    area: cleanFloat(length * width),
    perimeter: cleanFloat(2 * (length + width)),
    diagonal: cleanFloat(Math.sqrt(length * length + width * width)),
  }
}

// --- Square ---
export function squareSolve(side: number): ShapeResult {
  return {
    area: cleanFloat(side * side),
    perimeter: cleanFloat(4 * side),
    diagonal: cleanFloat(side * Math.SQRT2),
  }
}

// --- Trapezoid ---
export function trapezoidSolve(a: number, b: number, height: number): ShapeResult {
  return { area: cleanFloat(((a + b) / 2) * height) }
}

// --- Sphere ---
export function sphereSolve(radius: number): ShapeResult {
  return {
    volume: cleanFloat((4 / 3) * PI * radius ** 3),
    surfaceArea: cleanFloat(4 * PI * radius * radius),
  }
}

// --- Cylinder ---
export function cylinderSolve(radius: number, height: number): ShapeResult {
  return {
    volume: cleanFloat(PI * radius * radius * height),
    surfaceArea: cleanFloat(2 * PI * radius * (radius + height)),
  }
}

// --- Cone ---
export function coneSolve(radius: number, height: number): ShapeResult {
  const slantHeight = Math.sqrt(radius * radius + height * height)
  return {
    slantHeight: cleanFloat(slantHeight),
    volume: cleanFloat((1 / 3) * PI * radius * radius * height),
    surfaceArea: cleanFloat(PI * radius * (radius + slantHeight)),
  }
}

// --- Rectangular Prism (box) ---
export function boxSolve(length: number, width: number, height: number): ShapeResult {
  return {
    volume: cleanFloat(length * width * height),
    surfaceArea: cleanFloat(2 * (length * width + length * height + width * height)),
    diagonal: cleanFloat(Math.sqrt(length * length + width * width + height * height)),
  }
}
