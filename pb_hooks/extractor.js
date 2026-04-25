// pb_hooks/extractor.js
// LLM Call 2: Batch extract structured event data from raw text strings

var SYSTEM_PROMPT = "You are a rave/music event data extractor. Given an array of raw event text strings, extract structured data for each event. Return a JSON array of objects. For each event extract:\n- name: event name (string, required)\n- date: start date/time in ISO 8601 format (string or null)\n- end_date: end date/time in ISO 8601 if mentioned (string or null)\n- venue: venue or club name (string or null)\n- city: city or region (string or null)\n- artists: array of performer/DJ names (string[])\n- description: brief description of the event (string or null)\n\nReturn ONLY valid JSON, no markdown formatting. If a field cannot be determined, use null."

/**
 * @param {object} llmClient
 * @param {string[]} rawTexts - array of raw event strings from splitter
 * @returns {object[]} array of structured event objects
 */
function extractEvents(llmClient, rawTexts) {
  var result = llmClient.chatCompletionJSON(
    SYSTEM_PROMPT,
    "Extract structured event data from these raw texts:\n\n" + JSON.stringify(rawTexts)
  )

  var data = result.data
  if (!Array.isArray(data)) {
    throw new Error("Extractor: expected array, got " + typeof data)
  }

  // Validate and normalize each event
  var events = []
  for (var i = 0; i < data.length; i++) {
    var e = data[i]
    if (!e || typeof e !== "object") continue

    events.push({
      name: String(e.name || "Unnamed Event"),
      date: e.date || null,
      end_date: e.end_date || null,
      venue: e.venue || null,
      city: e.city || null,
      artists: Array.isArray(e.artists) ? e.artists : [],
      description: e.description || null,
    })
  }

  return events
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { extractEvents: extractEvents, SYSTEM_PROMPT: SYSTEM_PROMPT }
}
