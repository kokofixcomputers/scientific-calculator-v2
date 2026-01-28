// --- AST definitions ---

type Expr =
  | { type: 'number'; value: number }
  | { type: 'binary'; op: '+' | '-' | '*' | '/'; left: Expr; right: Expr }
  | { type: 'unary'; op: 'half' | 'double'; expr: Expr };

// --- Helpers ---

const num = (n: number): Expr => ({ type: 'number', value: n });

const bin = (op: '+' | '-' | '*' | '/', left: Expr, right: Expr): Expr => ({
  type: 'binary',
  op,
  left,
  right
});

const unary = (op: 'half' | 'double', expr: Expr): Expr => ({
  type: 'unary',
  op,
  expr
});

// --- Tokenization ---

function tokenize(sentence: string): string[] {
  const ignore = new Set(['the', 'a', 'an', 'by', 'than', 'and']);
  return sentence
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w && !ignore.has(w));
}

// --- Core parsing (words -> AST) ---

function parseExpression(words: string[]): Expr {
  const asNumber = (w: string | undefined): Expr | null => {
    if (w === undefined) return null;
    const n = Number(w);
    return Number.isNaN(n) ? null : num(n);
  };

  // 0) "N more than half of X" / "N less than half of X"
  //    e.g. ["4","more","half","of","2"]
  if (
    words.length >= 5 &&
    asNumber(words[0]) &&
    (words[1] === 'more' || words[1] === 'less') &&
    words[2] === 'half' &&
    words[3] === 'of'
  ) {
    const nExpr = asNumber(words[0])!;
    const opWord = words[1];
    const rest = words.slice(4);
    const inner = parseExpression(rest);
    const halfInner = unary('half', inner);
    const op: '+' | '-' = opWord === 'more' ? '+' : '-';
    return bin(op, nExpr, halfInner);
  }

  // 0b) GENERAL: "N more than X" / "N less than X" → N ± X
  // tokens: ["4","more","than","quotient","of","4","and","8"] → we ignore 'than' in tokenize,
  // so tokens: ["4","more","quotient","of","4","8"]
  if (
    words.length >= 3 &&
    asNumber(words[0]) &&
    (words[1] === 'more' || words[1] === 'less')
  ) {
    const nExpr = asNumber(words[0])!;
    const opWord = words[1];
    const rest = words.slice(2);
    const rhs = parseExpression(rest); // parse the whole remaining phrase
    const op: '+' | '-' = opWord === 'more' ? '+' : '-';
    return bin(op, nExpr, rhs);
  }

  // 1) "N more than X" / "N less than X"  → X ± N  (classic)
  if (words.length >= 4) {
    const firstNum = asNumber(words[0]);
    const opWord = words[1];
    const thanWord = words[2];
    if (firstNum && (opWord === 'more' || opWord === 'less') && thanWord === 'than') {
      const rest = words.slice(3);
      const rightExpr = parseExpression(rest);
      const op: '+' | '-' = opWord === 'more' ? '+' : '-';
      return bin(op, rightExpr, firstNum);
    }
  }

  // 2) "X more Y" / "X less Y"
  if (words.length >= 3) {
    const leftMaybe = asNumber(words[0]);
    const opWord = words[1];
    const rightMaybe = asNumber(words[2]);
    if (leftMaybe && rightMaybe && (opWord === 'more' || opWord === 'less')) {
      const op: '+' | '-' = opWord === 'more' ? '+' : '-';
      return bin(op, leftMaybe, rightMaybe);
    }
  }

  // 3) "<kw> of A and B" where kw in {sum,difference,product,quotient}
  const keyword = words[0];
  if (['sum', 'difference', 'product', 'quotient'].includes(keyword)) {
    const ofIndex = words.indexOf('of');
    const andIndex = words.indexOf('and');

    if (ofIndex === 1 && andIndex > ofIndex) {
      const leftWords = words.slice(ofIndex + 1, andIndex);
      const rightWords = words.slice(andIndex + 1);
      const leftExpr = parseExpression(leftWords);
      const rightExpr = parseExpression(rightWords);

      let op: '+' | '-' | '*' | '/';
      switch (keyword) {
        case 'sum':
          op = '+';
          break;
        case 'difference':
          op = '-';
          break;
        case 'product':
          op = '*';
          break;
        case 'quotient':
          op = '/';
          break;
        default:
          op = '+';
      }

      return bin(op, leftExpr, rightExpr);
    }
  }

  // 3b) "quotient of 4 and 8"
  if (
    words.length === 4 &&
    words[0] === 'quotient' &&
    words[1] === 'of' &&
    asNumber(words[2]) &&
    asNumber(words[3])
  ) {
    return bin('/', asNumber(words[2])!, asNumber(words[3])!);
  }

  // 4) "3 quotient 6"
  if (words.length === 3 && asNumber(words[0]) && words[1] === 'quotient' && asNumber(words[2])) {
    return bin('/', asNumber(words[0])!, asNumber(words[2])!);
  }

  // 5) Unary: "half of X", "double of X"
  if ((words[0] === 'half' || words[0] === 'double') && words[1] === 'of') {
    const inner = parseExpression(words.slice(2));
    const op: 'half' | 'double' = words[0] === 'half' ? 'half' : 'double';
    return unary(op, inner);
  }

  // 6) "half X" / "double X"
  if (words[0] === 'half') {
    const inner = parseExpression(words.slice(1));
    return unary('half', inner);
  }
  if (words[0] === 'double') {
    const inner = parseExpression(words.slice(1));
    return unary('double', inner);
  }

  // 7) Single number
  if (words.length === 1) {
    const n = asNumber(words[0]);
    if (n) return n;
  }

  // 8) Very simple "A times B", "A divided B"
  if (words.length === 3 && asNumber(words[0]) && asNumber(words[2])) {
    const left = asNumber(words[0])!;
    const right = asNumber(words[2])!;
    if (words[1] === 'times') return bin('*', left, right);
    if (words[1] === 'divided') return bin('/', left, right);
  }

  const n = asNumber(words[0]);
  return n ?? num(0);
}

// --- AST -> equation string ---

function precedence(expr: Expr): number {
  if (expr.type === 'number') return 3;
  if (expr.type === 'unary') return 3;
  if (expr.type === 'binary') {
    if (expr.op === '+' || expr.op === '-') return 1;
    if (expr.op === '*' || expr.op === '/') return 2;
  }
  return 0;
}

function exprToString(expr: Expr): string {
  switch (expr.type) {
    case 'number':
      return String(expr.value);

    case 'unary': {
      const inner = expr.expr;
      const innerStr = exprToString(inner);
      const needsParens = precedence(inner) < 2;
      const base = needsParens ? `(${innerStr})` : innerStr;
      if (expr.op === 'half') {
        return `${base} / 2`;
      } else {
        return `${base} * 2`;
      }
    }

    case 'binary': {
      const left = expr.left;
      const right = expr.right;
      const leftStr = exprToString(left);
      const rightStr = exprToString(right);
      const leftNeedsParens = precedence(left) < precedence(expr);
      const rightNeedsParens = precedence(right) < precedence(expr);
      const l = leftNeedsParens ? `(${leftStr})` : leftStr;
      const r = rightNeedsParens ? `(${rightStr})` : rightStr;
      return `${l} ${expr.op} ${r}`;
    }
  }
}

// --- Public API: equation string only ---

export function parseSentence(sentence: string): string {
  const tokens = tokenize(sentence);
  const ast = parseExpression(tokens);
  return exprToString(ast);
}
