import { describe, it, expect } from 'vitest'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { createDedupChecker, haversineMeters } = require('../dedup.js')

describe('haversineMeters', () => {
  it('returns 0 for same point', () => {
    expect(haversineMeters(52.5, 13.4, 52.5, 13.4)).toBe(0)
  })

  it('returns ~111km for 1 degree latitude', () => {
    const dist = haversineMeters(0, 0, 1, 0)
    expect(dist).toBeGreaterThan(110000)
    expect(dist).toBeLessThan(112000)
  })

  it('returns small distance for nearby points', () => {
    // ~100m apart
    const dist = haversineMeters(52.5111, 13.4544, 52.5120, 13.4544)
    expect(dist).toBeLessThan(200)
    expect(dist).toBeGreaterThan(50)
  })
})

describe('createDedupChecker', () => {
  it('returns not duplicate when no dao', () => {
    const checker = createDedupChecker({
      dao: null,
      config: { dedup: { radiusMeters: 500, dateToleranceHours: 12 } },
    })
    const result = checker.checkDuplicate({ date: '2026-05-01T23:00:00Z', latitude: 52.5, longitude: 13.4 })
    expect(result.isDuplicate).toBe(false)
  })

  it('returns not duplicate when date is missing', () => {
    const checker = createDedupChecker({
      dao: {},
      config: { dedup: { radiusMeters: 500, dateToleranceHours: 12 } },
    })
    const result = checker.checkDuplicate({ date: null, latitude: 52.5, longitude: 13.4 })
    expect(result.isDuplicate).toBe(false)
  })

  it('returns not duplicate when no records match', () => {
    const checker = createDedupChecker({
      dao: { findRecordsByFilter: () => [] },
      config: { dedup: { radiusMeters: 500, dateToleranceHours: 12 } },
    })
    const result = checker.checkDuplicate({ date: '2026-05-01T23:00:00Z', latitude: 52.5, longitude: 13.4 })
    expect(result.isDuplicate).toBe(false)
  })

  it('detects duplicate when record is within radius', () => {
    const checker = createDedupChecker({
      dao: {
        findRecordsByFilter: () => [{
          getFloat: (field: string) => field === 'latitude' ? 52.5001 : 13.4001,
          getId: () => 'rec123',
        }],
      },
      config: { dedup: { radiusMeters: 500, dateToleranceHours: 12 } },
    })
    const result = checker.checkDuplicate({ date: '2026-05-01T23:00:00Z', latitude: 52.5, longitude: 13.4 })
    expect(result.isDuplicate).toBe(true)
    expect(result.duplicateId).toBe('rec123')
  })

  it('does not flag as duplicate when record is far away', () => {
    const checker = createDedupChecker({
      dao: {
        findRecordsByFilter: () => [{
          getFloat: (field: string) => field === 'latitude' ? 53.0 : 14.0,
          getId: () => 'rec456',
        }],
      },
      config: { dedup: { radiusMeters: 500, dateToleranceHours: 12 } },
    })
    const result = checker.checkDuplicate({ date: '2026-05-01T23:00:00Z', latitude: 52.5, longitude: 13.4 })
    expect(result.isDuplicate).toBe(false)
  })
})
