import { describe, it, expect } from 'vitest'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { splitEvents } = require('../splitter.js')

function mockLlmClient(response: any) {
  return {
    chatCompletionJSON: () => ({ data: response, usage: null }),
  }
}

describe('splitEvents', () => {
  it('returns array of event strings', () => {
    const client = mockLlmClient(['event 1 text', 'event 2 text'])
    const result = splitEvents(client, 'some messy text')
    expect(result).toEqual(['event 1 text', 'event 2 text'])
  })

  it('trims whitespace from events', () => {
    const client = mockLlmClient(['  event 1  ', '  event 2  '])
    const result = splitEvents(client, 'text')
    expect(result).toEqual(['event 1', 'event 2'])
  })

  it('filters out empty strings', () => {
    const client = mockLlmClient(['event 1', '', '  ', 'event 2'])
    const result = splitEvents(client, 'text')
    expect(result).toEqual(['event 1', 'event 2'])
  })

  it('throws if LLM returns non-array', () => {
    const client = mockLlmClient({ not: 'an array' })
    expect(() => splitEvents(client, 'text')).toThrow('expected array')
  })

  it('throws if no valid events found', () => {
    const client = mockLlmClient(['', '  '])
    expect(() => splitEvents(client, 'text')).toThrow('no events found')
  })
})
