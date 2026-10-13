import test from 'node:test'
import assert from 'node:assert/strict'

import { verifyGateTokenHeader } from '../middleware/gateAuth.js'
import { createGateToken } from '../utils/security.js'

const makeResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code
    return this
  },
  json(body) {
    this.body = body
    return this
  },
})

test('rejects application requests without a gate token', () => {
  const response = makeResponse()
  let nextCalled = false

  verifyGateTokenHeader({ headers: {} }, response, () => {
    nextCalled = true
  })

  assert.equal(response.statusCode, 403)
  assert.equal(nextCalled, false)
})

test('allows a valid gate token', () => {
  const response = makeResponse()
  let nextCalled = false

  verifyGateTokenHeader({ headers: { 'x-gate-token': createGateToken() } }, response, () => {
    nextCalled = true
  })

  assert.equal(nextCalled, true)
})

test('rejects an expired gate token', () => {
  const response = makeResponse()
  let nextCalled = false

  verifyGateTokenHeader({ headers: { 'x-gate-token': createGateToken(-1) } }, response, () => {
    nextCalled = true
  })

  assert.equal(response.statusCode, 403)
  assert.equal(nextCalled, false)
})
