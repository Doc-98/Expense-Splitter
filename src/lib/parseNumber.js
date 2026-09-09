// JS's Number("3,50") is NaN — plain Number() only understands a period as
// the decimal separator. Many people (especially outside the US) type prices
// with a comma instead, so every manually-typed amount in this app should
// go through this first.
export function parseNumber(value) {
  if (value == null) return NaN
  const normalized = String(value).trim().replace(',', '.')
  return Number(normalized)
}

// A step up from parseNumber for the specific places someone is actually
// typing a bill item's cost by hand — a plain number still goes through
// unchanged, but this also accepts a small arithmetic expression
// ("2,30-1,25", "4.99*3"), so splitting a shared line total or
// subtracting a discount doesn't mean reaching for a separate calculator
// first. Deliberately its own function rather than folded into
// parseNumber itself: parseNumber is also used on text nobody actually
// typed (an OCR'd receipt line, an imported bank statement row), where a
// stray "-" from a misread character silently evaluating as subtraction
// would turn a bad read into a wrong number instead of the NaN that
// correctly flags it today.
export function parseAmount(value) {
  const plain = parseNumber(value)
  if (!Number.isNaN(plain)) return plain
  return evaluateExpression(value)
}

// + - * / with standard precedence, unary +/-, and parentheses — nothing
// else. Hand-rolled recursive-descent rather than eval()/Function(): this
// is free-typed input, and a small real parser that only ever recognizes
// digits, a single . or , per number, the four operators, and parentheses
// is no more code than sanitizing a string enough to trust handing it to
// either of those, without ever running anything resembling arbitrary
// code.
function evaluateExpression(value) {
  if (value == null) return NaN
  const tokens = tokenize(String(value))
  if (!tokens || tokens.length === 0) return NaN
  const result = parseExpr(tokens, 0)
  if (!result || result.pos !== tokens.length || !Number.isFinite(result.value)) return NaN
  // Rounded to the cent, same Math.round(x * 100) / 100 convention every
  // other money computation in this app already uses — a plain typed
  // number (parseNumber's own fast path above) is returned exactly as
  // typed, unrounded, but an evaluated expression like "2.3 - 1.25"
  // would otherwise come back as 1.0499999999999998, a binary
  // floating-point artifact of the subtraction itself, not anything the
  // person actually typed.
  return Math.round(result.value * 100) / 100
}

const NUMBER_RE = /^\d+([.,]\d+)?/

// Tokens are either a number (already normalized to a real JS number,
// comma-as-decimal-separator handled per individual number the same way
// parseNumber's own does) or one of the single-character operator/paren
// strings below. Returns null — not an empty array — the moment it hits
// anything else, so a stray letter (or a truly malformed number like
// "1.2.3") fails the whole expression rather than silently parsing part
// of it.
function tokenize(expr) {
  const tokens = []
  let i = 0
  while (i < expr.length) {
    const ch = expr[i]
    if (/\s/.test(ch)) {
      i++
      continue
    }
    if ('+-*/()'.includes(ch)) {
      tokens.push(ch)
      i++
      continue
    }
    const match = NUMBER_RE.exec(expr.slice(i))
    if (!match) return null
    tokens.push(Number(match[0].replace(',', '.')))
    i += match[0].length
  }
  return tokens
}

// Plain recursive descent, one function per precedence level (expression
// > term > factor). Each takes the token array and a starting index, and
// returns { value, pos } (pos is where it stopped, for the caller to
// resume from) — or null on failure, which unwinds the whole parse
// straight back to evaluateExpression's own null check rather than
// needing every level to re-check it explicitly.
function parseExpr(tokens, pos) {
  let left = parseTerm(tokens, pos)
  if (!left) return null
  while (tokens[left.pos] === '+' || tokens[left.pos] === '-') {
    const op = tokens[left.pos]
    const right = parseTerm(tokens, left.pos + 1)
    if (!right) return null
    left = { value: op === '+' ? left.value + right.value : left.value - right.value, pos: right.pos }
  }
  return left
}

function parseTerm(tokens, pos) {
  let left = parseFactor(tokens, pos)
  if (!left) return null
  while (tokens[left.pos] === '*' || tokens[left.pos] === '/') {
    const op = tokens[left.pos]
    const right = parseFactor(tokens, left.pos + 1)
    if (!right) return null
    // Division by zero is treated as invalid input (NaN, once this
    // unwinds), not Infinity — a bill item price of Infinity would
    // silently break every total/settlement computed from it.
    if (op === '/' && right.value === 0) return null
    left = { value: op === '*' ? left.value * right.value : left.value / right.value, pos: right.pos }
  }
  return left
}

function parseFactor(tokens, pos) {
  const t = tokens[pos]
  if (t === undefined) return null
  if (t === '+') return parseFactor(tokens, pos + 1)
  if (t === '-') {
    const inner = parseFactor(tokens, pos + 1)
    return inner ? { value: -inner.value, pos: inner.pos } : null
  }
  if (t === '(') {
    const inner = parseExpr(tokens, pos + 1)
    if (!inner || tokens[inner.pos] !== ')') return null
    return { value: inner.value, pos: inner.pos + 1 }
  }
  if (typeof t === 'number') return { value: t, pos: pos + 1 }
  return null
}
