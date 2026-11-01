import { handleDemoRequest } from './demoApi'

// The public demo intentionally never calls the live API. Feature pages still
// use the same request helpers, backed by browser-local sample data instead.
export const SECURITY_GATE_EXPIRED_EVENT = 'kanbakan:security-gate-expired'

export const apiFetch = (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> =>
  handleDemoRequest(input, init)
