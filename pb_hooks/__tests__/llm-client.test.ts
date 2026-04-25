import { describe, it, expect, vi } from 'vitest'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { createLlmClient, parseJsonResponse } = require('../llm-client.js')

describe('parseJsonResponse', () => {
  it('parses clean JSON', () => {
    const result = parseJsonResponse('["event 1", "event 2"]')
    expect(result.error).toBeNull()
    expect(result.data).toEqual(['event 1', 'event 2'])
  })

  it('strips markdown fences', () => {
    const result = parseJsonResponse('```json\n["event 1"]\n```')
    expect(result.error).toBeNull()
    expect(result.data).toEqual(['event 1'])
  })

  it('strips fences without language tag', () => {
    const result = parseJsonResponse('```\n{"key": "val"}\n```')
    expect(result.error).toBeNull()
    expect(result.data).toEqual({ key: 'val' })
  })

  it('handles whitespace around fences', () => {
    const result = parseJsonResponse('  ```json  \n  ["a"]  \n  ```  ')
    expect(result.error).toBeNull()
    expect(result.data).toEqual(['a'])
  })

  it('returns error for empty input', () => {
    expect(parseJsonResponse('').error).toBe('empty response')
    expect(parseJsonResponse(null).error).toBe('empty response')
    expect(parseJsonResponse(undefined).error).toBe('empty response')
  })

  it('returns error for invalid JSON', () => {
    const result = parseJsonResponse('not json at all')
    expect(result.error).toBeTruthy()
    expect(result.data).toBeNull()
  })

  it('returns error for truncated JSON', () => {
    const result = parseJsonResponse('{"name": "test", "arr": [1, 2,')
    expect(result.error).toBeTruthy()
  })
})

describe('createLlmClient', () => {
  function makeMockDeps(responseBody, statusCode = 200) {
    return {
      httpSend: vi.fn(() => ({
        statusCode,
        json: responseBody,
        body: JSON.stringify(responseBody),
      })),
      getenv: vi.fn((name) => {
        if (name === 'LLM_API_KEY') return 'test-key'
        if (name === 'LLM_BASE_URL') return 'https://test.example.com'
        return ''
      }),
      config: {
        llm: { model: 'test-model', maxTokens: 100, temperature: 0, timeoutSeconds: 10 },
      },
    }
  }

  it('sends correct request to LLM API', () => {
    const deps = makeMockDeps({
      choices: [{ message: { content: 'hello' } }],
      usage: { total_tokens: 10 },
    })
    const client = createLlmClient(deps)
    const result = client.chatCompletion('system prompt', 'user message')

    expect(result.content).toBe('hello')
    expect(result.usage.total_tokens).toBe(10)

    // Verify the request
    const call = deps.httpSend.mock.calls[0][0]
    expect(call.url).toBe('https://test.example.com/chat/completions')
    expect(call.method).toBe('POST')
    expect(call.headers['authorization']).toBe('Bearer test-key')

    const body = JSON.parse(call.body)
    expect(body.model).toBe('test-model')
    expect(body.messages[0].content).toBe('system prompt')
    expect(body.messages[1].content).toBe('user message')
  })

  it('throws when API key is missing', () => {
    const deps = makeMockDeps({})
    deps.getenv = () => ''
    const client = createLlmClient(deps)

    expect(() => client.chatCompletion('sys', 'msg')).toThrow('LLM_API_KEY')
  })

  it('throws on non-2xx status', () => {
    const deps = makeMockDeps({ error: 'unauthorized' }, 401)
    const client = createLlmClient(deps)

    expect(() => client.chatCompletion('sys', 'msg')).toThrow('HTTP 401')
  })

  it('throws when no choices returned', () => {
    const deps = makeMockDeps({ choices: [] })
    const client = createLlmClient(deps)

    expect(() => client.chatCompletion('sys', 'msg')).toThrow('no choices')
  })

  describe('chatCompletionJSON', () => {
    it('parses JSON response on first try', () => {
      const deps = makeMockDeps({
        choices: [{ message: { content: '["event1", "event2"]' } }],
      })
      const client = createLlmClient(deps)
      const result = client.chatCompletionJSON('sys', 'msg')

      expect(result.data).toEqual(['event1', 'event2'])
      expect(deps.httpSend).toHaveBeenCalledTimes(1)
    })

    it('retries once on invalid JSON then succeeds', () => {
      let callCount = 0
      const deps = makeMockDeps({})
      deps.httpSend = vi.fn(() => {
        callCount++
        return {
          statusCode: 200,
          json: {
            choices: [{
              message: {
                content: callCount === 1 ? 'Here are the events: [invalid' : '["fixed"]',
              },
            }],
          },
        }
      })
      const client = createLlmClient(deps)
      const result = client.chatCompletionJSON('sys', 'msg')

      expect(result.data).toEqual(['fixed'])
      expect(deps.httpSend).toHaveBeenCalledTimes(2)
    })

    it('throws after retry still fails', () => {
      const deps = makeMockDeps({
        choices: [{ message: { content: 'not json' } }],
      })
      const client = createLlmClient(deps)

      expect(() => client.chatCompletionJSON('sys', 'msg')).toThrow('invalid JSON after retry')
    })
  })
})
