export const SECURITY_GATE_EXPIRED_EVENT = 'kanbakan:security-gate-expired'

export const apiFetch = async (
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> => {
  const headers = new Headers(init.headers)
  const gateToken = sessionStorage.getItem('gateToken')
  if (gateToken) {
    headers.set('x-gate-token', gateToken)
  }

  const response = await fetch(input, { ...init, headers })
  if (response.status === 403) {
    const data = await response.clone().json().catch(() => null)
    if (
      typeof data?.error === 'string' &&
      data.error.startsWith('Security gate verification token')
    ) {
      sessionStorage.removeItem('gateToken')
      sessionStorage.removeItem('securityGatePassed')
      window.dispatchEvent(new Event(SECURITY_GATE_EXPIRED_EVENT))
    }
  }

  return response
}
