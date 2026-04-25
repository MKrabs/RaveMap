// pb_hooks/llm-client.js
// Wrapper around $http.send() for OpenAI-compatible API at chat.exxeta.com
//
// NOTE: This module is designed to work in PocketBase's goja JS engine.
// For testing, $http and $os must be provided/mocked via dependency injection.

/**
 * Create an LLM client.
 * @param {object} deps - { httpSend, getenv } for dependency injection (testing)
 *                        Falls back to PB globals $http.send / $os.getenv
 */
function createLlmClient(deps) {
  const httpSend = (deps && deps.httpSend) || function(opts) { return $http.send(opts) }
  const getenv = (deps && deps.getenv) || function(name) { return $os.getenv(name) }
  const config = (deps && deps.config) || require(__hooks + "/config.js")

  /**
   * Send a chat completion request to the LLM.
   * @param {string} systemPrompt
   * @param {string} userMessage
   * @param {object} [opts] - { model, maxTokens, temperature }
   * @returns {{ content: string, usage: object }} parsed response
   */
  function chatCompletion(systemPrompt, userMessage, opts) {
    const apiKey = getenv("LLM_API_KEY")
    const baseUrl = getenv("LLM_BASE_URL") || "https://chat.exxeta.com"

    if (!apiKey) {
      throw new Error("LLM_API_KEY environment variable is not set")
    }

    const model = (opts && opts.model) || config.llm.model
    const maxTokens = (opts && opts.maxTokens) || config.llm.maxTokens
    const temperature = (opts && opts.temperature !== undefined) ? opts.temperature : config.llm.temperature
    const timeout = (opts && opts.timeout) || config.llm.timeoutSeconds

    const requestBody = JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: maxTokens,
      temperature: temperature,
    })

    var res = httpSend({
      url: baseUrl + "/chat/completions",
      method: "POST",
      body: requestBody,
      headers: {
        "content-type": "application/json",
        "authorization": "Bearer " + apiKey,
      },
      timeout: timeout,
    })

    if (res.statusCode < 200 || res.statusCode >= 300) {
      var errorBody = ""
      try { errorBody = JSON.stringify(res.json) } catch(e) { errorBody = String(res.body) }
      throw new Error("LLM API error (HTTP " + res.statusCode + "): " + errorBody)
    }

    var data = res.json
    if (!data || !data.choices || !data.choices.length) {
      throw new Error("LLM API returned no choices: " + JSON.stringify(data))
    }

    return {
      content: data.choices[0].message.content,
      usage: data.usage || null,
    }
  }

  /**
   * Chat completion that expects a JSON response. Strips markdown fences,
   * parses JSON, and retries once on parse failure.
   */
  function chatCompletionJSON(systemPrompt, userMessage, opts) {
    var response = chatCompletion(systemPrompt, userMessage, opts)
    var parsed = parseJsonResponse(response.content)

    if (parsed.error) {
      // Retry once with reinforcement
      var retryPrompt = userMessage + "\n\nIMPORTANT: Your previous response was not valid JSON. Return ONLY valid JSON, no markdown formatting, no explanations."
      response = chatCompletion(systemPrompt, retryPrompt, opts)
      parsed = parseJsonResponse(response.content)

      if (parsed.error) {
        throw new Error("LLM returned invalid JSON after retry: " + parsed.error + "\nRaw: " + response.content)
      }
    }

    return {
      data: parsed.data,
      usage: response.usage,
    }
  }

  return {
    chatCompletion: chatCompletion,
    chatCompletionJSON: chatCompletionJSON,
  }
}

/**
 * Strip markdown fences and parse JSON. Pure function — testable without mocks.
 * @param {string} raw
 * @returns {{ data: any, error: string|null }}
 */
function parseJsonResponse(raw) {
  if (!raw || typeof raw !== "string") {
    return { data: null, error: "empty response" }
  }

  // Strip markdown code fences
  var cleaned = raw.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "")
  cleaned = cleaned.trim()

  try {
    var data = JSON.parse(cleaned)
    return { data: data, error: null }
  } catch (e) {
    return { data: null, error: e.message || String(e) }
  }
}

// Export for both PB hooks (require) and Node.js (testing)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { createLlmClient: createLlmClient, parseJsonResponse: parseJsonResponse }
}
