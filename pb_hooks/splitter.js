// pb_hooks/splitter.js
// LLM Call 1: Split messy text into individual event strings

var SYSTEM_PROMPT = "You are an event text splitter. Given a messy block of text that contains information about multiple rave/music events, split it into individual events. Return a JSON array of strings, where each string contains the raw text for ONE event. Do not modify or summarize the text — preserve the original wording. Return ONLY valid JSON, no markdown formatting."

/**
 * @param {object} llmClient - created via createLlmClient()
 * @param {string} text - raw user input
 * @returns {string[]} array of raw event strings
 */
function splitEvents(llmClient, text) {
  var result = llmClient.chatCompletionJSON(
    SYSTEM_PROMPT,
    "Split this text into individual events:\n\n" + text
  )

  var data = result.data
  if (!Array.isArray(data)) {
    throw new Error("Splitter: expected array, got " + typeof data)
  }

  // Validate each element is a non-empty string
  var events = []
  for (var i = 0; i < data.length; i++) {
    if (typeof data[i] === "string" && data[i].trim().length > 0) {
      events.push(data[i].trim())
    }
  }

  if (events.length === 0) {
    throw new Error("Splitter: no events found in text")
  }

  return events
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { splitEvents: splitEvents, SYSTEM_PROMPT: SYSTEM_PROMPT }
}
