# PocketBase 0.22.27 JS Hooks — API Cheat Sheet

**IMPORTANT: PB 0.22.x uses `$app.dao().*` syntax. Do NOT use 0.23+ API (`$app.findRecordById()` etc.)**

## Route Registration

```js
routerAdd("POST", "/api/ravemap/add-events", (e) => {
  // handler
  return e.json(200, { success: true })
}, $apis.requireAuth())
```

## HTTP Requests

```js
const res = $http.send({
  url: "https://example.com/api",
  method: "POST",
  body: JSON.stringify({ key: "value" }),
  headers: { "content-type": "application/json", "authorization": "Bearer xxx" },
  timeout: 120  // seconds
})
// res.statusCode, res.json, res.body, res.headers
```

## Environment Variables

```js
const apiKey = $os.getenv("LLM_API_KEY")
```

## Collection / Record Operations (0.22.x DAO API)

```js
// Find collection
const collection = $app.dao().findCollectionByNameOrId("events")

// Create record
const record = new Record(collection)
record.set("name", "Event Name")
record.set("date", "2026-05-01T23:00:00Z")
$app.dao().saveRecord(record)

// Find records with filter
const records = $app.dao().findRecordsByFilter(
  "events",           // collection
  "date = {:date}",   // filter
  "-created",         // sort
  10,                 // limit
  0,                  // offset
  { date: "2026-05-01" }  // filter params
)

// Find single record
const record = $app.dao().findFirstRecordByFilter("events", "name = {:name}", { name: "Test" })

// Update
record.set("description", "Updated")
$app.dao().saveRecord(record)

// Delete
$app.dao().deleteRecord(record)
```

## Request Handling

```js
// Read JSON body
const data = new DynamicModel({ text: "" })
e.bindBody(data)

// Read raw body
const raw = toString(e.request.body)

// Query params
const q = e.request.url.query().get("param")
```

## Module System

```js
// Only inside handlers — use require() with __hooks
const utils = require(`${__hooks}/utils.js`)
```

## Errors

```js
throw new BadRequestError("message")
throw new InternalServerError("message")
```
