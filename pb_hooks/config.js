// pb_hooks/config.js
// Non-secret configuration for the add-events pipeline

module.exports = {
  llm: {
    model: "eu.anthropic.claude-haiku-4-5",
    maxTokens: 4096,
    temperature: 0.1,
    timeoutSeconds: 60,
  },
  nominatim: {
    baseUrl: "https://nominatim.openstreetmap.org",
    timeoutSeconds: 10,
    userAgent: "RaveMap/1.0",
  },
  dedup: {
    radiusMeters: 500,
    dateToleranceHours: 12,
  },
}
