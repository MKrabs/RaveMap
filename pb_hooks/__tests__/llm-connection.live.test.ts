// pb_hooks/__tests__/llm-connection.live.test.ts
// Live integration test for LLM connection to ai.exxeta.info
// Run manually: npx vitest run pb_hooks/__tests__/llm-connection.live.test.ts
//
// Requires LLM_API_KEY and LLM_BASE_URL env vars (from .env file)

import { describe, it, expect } from 'vitest'
import { createRequire } from 'module'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const require = createRequire(import.meta.url)
const { parseJsonResponse } = require('../llm-client.js')

// Load .env manually for live tests
function loadEnv() {
  try {
    const envPath = resolve(import.meta.dirname, '../../.env')
    const content = readFileSync(envPath, 'utf-8')
    const vars: Record<string, string> = {}
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const [key, ...rest] = trimmed.split('=')
      vars[key.trim()] = rest.join('=').trim()
    }
    return vars
  } catch {
    return {}
  }
}

const env = loadEnv()

describe('Live LLM Connection', () => {
  const apiKey = env['LLM_API_KEY'] || process.env.LLM_API_KEY || ''
  const baseUrl = env['LLM_BASE_URL'] || process.env.LLM_BASE_URL || 'https://ai.exxeta.info'
  const model = 'eu.anthropic.claude-haiku-4-5'

  it('connects to ai.exxeta.info and gets a response', async () => {
    if (!apiKey) {
      console.log('SKIP: LLM_API_KEY not set')
      return
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant. Reply with exactly one word.' },
          { role: 'user', content: 'Say "connected"' },
        ],
        max_tokens: 10,
        temperature: 0,
      }),
    })

    console.log('Status:', response.status)
    const data = await response.json() as any
    console.log('Response:', JSON.stringify(data, null, 2))

    expect(response.status).toBe(200)
    expect(data.choices).toBeDefined()
    expect(data.choices.length).toBeGreaterThan(0)
    expect(data.choices[0].message.content).toBeTruthy()

    console.log('LLM says:', data.choices[0].message.content)
  }, 30000)

  it('handles a JSON extraction task', async () => {
    if (!apiKey) {
      console.log('SKIP: LLM_API_KEY not set')
      return
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a data extractor. Return ONLY valid JSON, no markdown formatting.',
          },
          {
            role: 'user',
            content: 'Extract the event name and date from this text: "Berghain Klubnacht this Saturday May 3rd with Ben Klock and Marcel Dettmann". Return as {"name": "...", "date": "..."}',
          },
        ],
        max_tokens: 200,
        temperature: 0,
      }),
    })

    const data = await response.json() as any
    console.log('Status:', response.status)
    console.log('Full response:', JSON.stringify(data, null, 2))
    expect(response.status).toBe(200)

    const content = data.choices[0].message.content
    console.log('Raw LLM response:', content)

    const parsed = parseJsonResponse(content)
    console.log('Parsed:', parsed)

    expect(parsed.error).toBeNull()
    expect(parsed.data).toHaveProperty('name')
    expect(parsed.data).toHaveProperty('date')
    console.log('Extracted event:', parsed.data)
  }, 30000)
})
