import { describe, it, expect } from 'vitest'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { createGeocoder } = require('../geocoder.js')

describe('createGeocoder', () => {
  it('returns lat/lon from Nominatim response', () => {
    const geocoder = createGeocoder({
      httpSend: () => ({
        statusCode: 200,
        json: [{ lat: '52.5111', lon: '13.4544' }],
      }),
      config: {
        nominatim: { baseUrl: 'https://nominatim.test', timeoutSeconds: 5, userAgent: 'Test/1.0' },
      },
    })
    const result = geocoder.geocode('Berghain', 'Berlin')
    expect(result).toEqual({ lat: 52.5111, lon: 13.4544 })
  })

  it('returns null when no results', () => {
    const geocoder = createGeocoder({
      httpSend: () => ({ statusCode: 200, json: [] }),
      config: {
        nominatim: { baseUrl: 'https://nominatim.test', timeoutSeconds: 5, userAgent: 'Test/1.0' },
      },
    })
    expect(geocoder.geocode('Nowhere', 'Nowhere')).toBeNull()
  })

  it('returns null on HTTP error', () => {
    const geocoder = createGeocoder({
      httpSend: () => ({ statusCode: 500, json: null }),
      config: {
        nominatim: { baseUrl: 'https://nominatim.test', timeoutSeconds: 5, userAgent: 'Test/1.0' },
      },
    })
    expect(geocoder.geocode('Berghain', 'Berlin')).toBeNull()
  })

  it('returns null when both venue and city are null', () => {
    const geocoder = createGeocoder({
      httpSend: () => { throw new Error('should not be called') },
      config: {
        nominatim: { baseUrl: 'https://nominatim.test', timeoutSeconds: 5, userAgent: 'Test/1.0' },
      },
    })
    expect(geocoder.geocode(null, null)).toBeNull()
  })

  it('caches repeated queries', () => {
    let callCount = 0
    const geocoder = createGeocoder({
      httpSend: () => {
        callCount++
        return { statusCode: 200, json: [{ lat: '52.5', lon: '13.4' }] }
      },
      config: {
        nominatim: { baseUrl: 'https://nominatim.test', timeoutSeconds: 5, userAgent: 'Test/1.0' },
      },
    })
    geocoder.geocode('Berghain', 'Berlin')
    geocoder.geocode('Berghain', 'Berlin')
    expect(callCount).toBe(1)
  })

  it('returns null on exception and does not throw', () => {
    const geocoder = createGeocoder({
      httpSend: () => { throw new Error('network error') },
      config: {
        nominatim: { baseUrl: 'https://nominatim.test', timeoutSeconds: 5, userAgent: 'Test/1.0' },
      },
    })
    expect(geocoder.geocode('Berghain', 'Berlin')).toBeNull()
  })
})
