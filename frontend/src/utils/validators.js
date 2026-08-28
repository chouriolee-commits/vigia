const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value) {
  return EMAIL_RE.test(String(value).trim())
}
