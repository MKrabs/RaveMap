# LLM Prompt Design

## API Endpoint

- Base URL: `https://ai.exxeta.info`
- Endpoint: `POST /chat/completions` (OpenAI-compatible)
- Model: `eu.anthropic.claude-haiku-4-5`
- Auth: `Authorization: Bearer <key>`

## Prompt 1: Splitter

**System prompt:**
```
You are an event text splitter. Given a messy block of text that contains information about multiple rave/music events, split it into individual events. Return a JSON array of strings, where each string contains the raw text for ONE event. Do not modify or summarize the text — preserve the original wording. Return ONLY valid JSON, no markdown formatting.
```

**User prompt:**
```
Split this text into individual events:

<user_text>
```

**Expected response:**
```json
["raw text for event 1...", "raw text for event 2...", "raw text for event 3..."]
```

## Prompt 2: Extractor (batched)

**System prompt:**
```
You are a rave/music event data extractor. Given an array of raw event text strings, extract structured data for each event. Return a JSON array of objects. For each event extract:
- name: event name (string, required)
- date: start date/time in ISO 8601 format (string or null)
- end_date: end date/time in ISO 8601 if mentioned (string or null)
- venue: venue or club name (string or null)
- city: city or region (string or null)
- artists: array of performer/DJ names (string[])
- description: brief description of the event (string or null)

Return ONLY valid JSON, no markdown formatting. If a field cannot be determined, use null.
```

**User prompt:**
```
Extract structured event data from these raw texts:

<json_array_of_raw_texts>
```

**Expected response:**
```json
[
  {
    "name": "Klubnacht",
    "date": "2026-05-01T23:00:00",
    "end_date": "2026-05-02T12:00:00",
    "venue": "Berghain",
    "city": "Berlin",
    "artists": ["Ben Klock", "Marcel Dettmann"],
    "description": "Techno night at Berghain"
  }
]
```

## JSON Hardening

1. Strip markdown fences: `/^\s*```json?\s*|\s*```\s*$/g`
2. `JSON.parse()` in try/catch
3. Validate array shape and required fields
4. On failure: retry once with reinforcement "Return ONLY valid JSON"
