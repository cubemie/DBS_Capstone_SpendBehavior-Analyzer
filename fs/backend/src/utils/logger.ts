/**
 * Logger utility — clean, colorized terminal output.
 * Zero external dependencies, pakai ANSI escape codes.
 */

// ─── ANSI Color Codes ────────────────────────────────────────────────────────
const USE_COLOR = process.stdout.isTTY ?? false

const RESET  = USE_COLOR ? '\x1b[0m' : ''
const BOLD   = USE_COLOR ? '\x1b[1m' : ''
const DIM    = USE_COLOR ? '\x1b[2m' : ''
const GREEN  = USE_COLOR ? '\x1b[32m' : ''
const YELLOW = USE_COLOR ? '\x1b[33m' : ''
const RED    = USE_COLOR ? '\x1b[31m' : ''
const CYAN   = USE_COLOR ? '\x1b[36m' : ''
const WHITE  = USE_COLOR ? '\x1b[37m' : ''

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pad(str: string, length: number): string {
  return str.padEnd(length, '.')
}

function getStatusLabel(status: number): string {
  if (status >= 500) return `${RED}${BOLD}${status} Internal Server Error${RESET}`
  if (status >= 400) return `${YELLOW}${status} ${getStatusText(status)}${RESET}`
  return `${GREEN}${status}${RESET}`
}

function getStatusText(status: number): string {
  const map: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
  }
  return map[status] ?? 'Client Error'
}

function getSymbol(status: number): string {
  if (status >= 500) return `${RED}✗${RESET}`
  if (status >= 400) return `${YELLOW}⚠${RESET}`
  return `${GREEN}✓${RESET}`
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Log satu HTTP request ke terminal.
 */
export function logRequest(
  method: string,
  url: string,
  status: number,
  durationMs: number,
): void {
  const symbol    = getSymbol(status)
  const methodStr = `${CYAN}${BOLD}${method.padEnd(5)}${RESET}`
  const label     = getStatusLabel(status)
  const timing    = `${DIM}(${durationMs}ms)${RESET}`
  const ts        = new Date().toISOString()

  const paddedUrl = pad(`${url} `, 45)

  console.log(`${DIM}${ts}${RESET} ${symbol} ${methodStr}${WHITE}${paddedUrl}${RESET} ${label} ${timing}`)
}

/**
 * Log error 5xx — tampilkan stack trace yang clean,
 * tanpa req/res object dump.
 */
export function logError(err: Error, context?: string): void {
  const separator = `${RED}─────────────────────────────────────────${RESET}`
  console.error(separator)
  if (context) {
    console.error(`${RED}${BOLD}[ERROR]${RESET} ${context}`)
  }
  console.error(`${RED}${BOLD}${err.name}${RESET}: ${err.message}`)
  if (err.stack) {
    // Tampilkan stack trace tapi filter baris node_modules
    const stack = err.stack
      .split('\n')
      .slice(1)                                    // buang baris pertama (sudah ada di atas)
      .filter(line => !line.includes('node_modules'))
      .map(line => `  ${DIM}${line.trim()}${RESET}`)
      .join('\n')
    if (stack) console.error(stack)
  }
  console.error(separator)
}

/**
 * Log startup info server.
 */
export function logStartup(port: number): void {
  console.log(`\n${GREEN}${BOLD}  ✓ Server ready${RESET}`)
  console.log(`${DIM}  ───────────────────────────────${RESET}`)
  console.log(`  ${CYAN}Local${RESET}   http://localhost:${port}`)
  console.log(`  ${CYAN}API${RESET}     http://localhost:${port}/api/v1`)
  console.log(`  ${CYAN}Health${RESET}  http://localhost:${port}/`)
  console.log(`${DIM}  ───────────────────────────────${RESET}\n`)
}

/**
 * Log info umum (opsional, untuk debugging ringan).
 */
export function logInfo(message: string): void {
  console.log(`${DIM}[info]${RESET} ${message}`)
}
