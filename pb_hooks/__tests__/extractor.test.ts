import { describe, it, expect } from 'vitest'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { extractEvents } = require('../extractor.js')

function mockLlmClient(response: any) {
  return {
    chatCompletionJSON: () => ({ data: response, usage: null }),
  }
}

describe('extractEvents', () => {
  it('extracts structured events', () => {
    const client = mockLlmClient([
      {
        name: 'Klubnacht',
        date: '2026-05-01T23:00:00',
        end_date: '2026-05-02T12:00:00',
        venue: 'Berghain',
        city: 'Berlin',
        artists: ['Ben Klock'],
        description: 'Techno night',
      },
    ])
    const result = extractEvents(client, ['raw text'])
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Klubnacht')
    expect(result[0].venue).toBe('Berghain')
    expect(result[0].artists).toEqual(['Ben Klock'])
  })

  it('defaults missing fields to null', () => {
    const client = mockLlmClient([{ name: 'Minimal' }])
    const result = extractEvents(client, ['text'])
    expect(result[0]).toEqual({
      name: 'Minimal',
      date: null,
      end_date: null,
      venue: null,
      city: null,
      artists: [],
      description: null,
    })
  })

  it('names unnamed events', () => {
    const client = mockLlmClient([{}])
    const result = extractEvents(client, ['text'])
    expect(result[0].name).toBe('Unnamed Event')
  })

  it('throws if LLM returns non-array', () => {
    const client = mockLlmClient('not an array')
    expect(() => extractEvents(client, ['text'])).toThrow('expected array')
  })

  it('skips non-object entries', () => {
    const client = mockLlmClient([{ name: 'Good' }, null, 42, 'string'])
    const result = extractEvents(client, ['a', 'b', 'c', 'd'])
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Good')
  })
})
