// pb_hooks/main.pb.js
// Route: POST /api/ravemap/add-events
// Pipeline: split → extract → geocode → dedup → save

console.log("[RaveMap] Hook file main.pb.js loaded — registering POST /api/ravemap/add-events")

routerAdd("POST", "/api/ravemap/add-events", function(e) {
  console.log("[RaveMap] POST /api/ravemap/add-events called")

  var llmClientMod = require(__hooks + "/llm-client.js")
  var splitterMod = require(__hooks + "/splitter.js")
  var extractorMod = require(__hooks + "/extractor.js")
  var geocoderMod = require(__hooks + "/geocoder.js")
  var dedupMod = require(__hooks + "/dedup.js")

  // Parse request body
  var body = new DynamicModel({ text: "" })
  e.bind(body)

  console.log("[RaveMap] Received text: " + (body.text || "").substring(0, 100))
  var text = body.text
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return e.json(400, { success: false, events: [], error: "text field is required" })
  }

  try {
    // Initialize pipeline components
    var llmClient = llmClientMod.createLlmClient()
    var geocoder = geocoderMod.createGeocoder()
    var dedup = dedupMod.createDedupChecker({ dao: $app.dao() })

    // Step 1: Split text into individual event strings
    console.log("[RaveMap] Step 1: Splitting text...")
    var rawTexts = splitterMod.splitEvents(llmClient, text)
    console.log("[RaveMap] Split into " + rawTexts.length + " event(s)")

    // Step 2: Batch extract structured data
    console.log("[RaveMap] Step 2: Extracting structured data...")
    var extracted = extractorMod.extractEvents(llmClient, rawTexts)
    console.log("[RaveMap] Extracted " + extracted.length + " event(s)")

    // Step 3-5: Geocode, dedup, save — per event
    var collection = $app.dao().findCollectionByNameOrId("events")
    var results = []

    for (var i = 0; i < extracted.length; i++) {
      var ev = extracted[i]
      var result = {
        name: ev.name,
        date: ev.date,
        end_date: ev.end_date,
        venue: ev.venue,
        city: ev.city,
        artists: ev.artists,
        description: ev.description,
        latitude: null,
        longitude: null,
        duplicate: false,
        duplicate_id: null,
        saved: false,
        record_id: null,
        error: null,
      }

      try {
        // Geocode
        var geo = geocoder.geocode(ev.venue, ev.city)
        if (geo) {
          result.latitude = geo.lat
          result.longitude = geo.lon
        }

        // Dedup
        var dupCheck = dedup.checkDuplicate({
          date: ev.date,
          latitude: result.latitude,
          longitude: result.longitude,
        })

        if (dupCheck.isDuplicate) {
          result.duplicate = true
          result.duplicate_id = dupCheck.duplicateId
        } else {
          // Save to PocketBase
          var record = new Record(collection)
          record.set("name", ev.name)
          record.set("date", ev.date || "")
          record.set("description", ev.description || "")
          record.set("latitude", result.latitude || 0)
          record.set("longitude", result.longitude || 0)
          // Extended fields (if collection has them)
          try { record.set("end_date", ev.end_date || "") } catch(_) {}
          try { record.set("venue", ev.venue || "") } catch(_) {}
          try { record.set("city", ev.city || "") } catch(_) {}
          try { record.set("artists", JSON.stringify(ev.artists || [])) } catch(_) {}
          try { record.set("source_text", rawTexts[i] || "") } catch(_) {}

          $app.dao().saveRecord(record)
          result.saved = true
          result.record_id = record.getId()
        }
      } catch (err) {
        result.error = String(err.message || err)
      }

      results.push(result)
    }

    return e.json(200, { success: true, events: results, error: null })

  } catch (err) {
    console.log("[RaveMap] ERROR: " + String(err.message || err))
    return e.json(500, { success: false, events: [], error: String(err.message || err) })
  }
})
