# Add Events Pipeline — Architecture

## Overview

POST messy text → LLM splits into individual events → LLM extracts structured data → Nominatim geocodes → dedup check → save to PocketBase.

## Data Flow

```
User POST /api/ravemap/add-events
  body: { text: "messy string with multiple events" }
       │
       ▼
┌─────────────────────┐
│  LLM Call 1: Split  │  Single call — returns array of raw event strings
│  (chat.exxeta.com)  │
└─────────┬───────────┘
          │
          ▼
┌──────────────────────────┐
│  LLM Call 2: Extract All │  Single batched call — returns structured JSON array
│  name, date, venue/city, │  [{name, date, endDate, venue, city, artists[], description}]
│  artists[], description  │
└─────────┬────────────────┘
          │
          ▼
┌────────────────────────┐
│  Nominatim Geocoding   │  Per unique venue/city — deterministic, no hallucination
│  (OpenStreetMap API)   │
└─────────┬──────────────┘
          │
          ▼
┌────────────────────────┐
│  Dedup Check           │  date + Haversine distance < 500m = likely duplicate
│  (PocketBase query)    │
└─────────┬──────────────┘
          │
          ▼
┌────────────────────────┐
│  Save to PocketBase    │  New records in `events` collection
└────────────────────────┘
```

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| 2 LLM calls max (split + extract-all) | Avoids N×timeout with synchronous `$http.send()` |
| Nominatim for geocoding | LLMs hallucinate coordinates; deterministic API is reliable |
| JSON array for artists (MVP) | Simple, avoidable migration later to separate collection |
| Dedup via date+location | More reliable than fuzzy name matching |
| API key in `.env` file | Not in docker-compose.yml or code; `.env` is gitignored |

## PocketBase 0.22.27 Constraints

- JS hooks engine: goja (ES5 + partial ES6, NO async/await)
- HTTP: `$http.send()` — synchronous, blocking
- DB: `$app.dao().*` API (NOT the newer `$app.find*` API from 0.23+)
- Modules: CommonJS `require()` only, no ESM, no node_modules
- Handler isolation: top-level vars not accessible inside handlers; use `require()`

## Schema (events collection — extended)

Current fields: `name`, `date`, `description`, `latitude`, `longitude`

New fields needed:
- `end_date` (date) — optional, for multi-day events
- `venue` (text) — venue name
- `city` (text) — city/region
- `artists` (json) — array of artist name strings
- `source_text` (text) — original raw text for traceability

## File Structure

```
pb_hooks/
├── main.pb.js          # Route registration (thin wrapper)
├── llm-client.js       # $http.send() wrapper for chat.exxeta.com
├── splitter.js         # LLM prompt + response parsing for splitting
├── extractor.js        # LLM prompt + response parsing for extraction
├── geocoder.js         # Nominatim API wrapper
├── dedup.js            # Haversine + PB query for duplicate detection
├── validator.js        # JSON shape validation, coordinate bounds
└── config.js           # Non-secret config (model name, timeouts, etc.)
```

## Error Handling

- LLM JSON response: strip markdown fences → JSON.parse → validate shape → retry once on failure
- Geocoding failure: log warning, skip coordinates (save with 0,0 and flag)
- Partial success: save events that succeed, return errors for those that failed
