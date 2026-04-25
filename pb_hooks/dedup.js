// pb_hooks/dedup.js
// Duplicate detection: same date + location within radius = duplicate

/**
 * Haversine distance in meters between two lat/lon points.
 */
function haversineMeters(lat1, lon1, lat2, lon2) {
  var R = 6371000 // Earth radius in meters
  var toRad = Math.PI / 180
  var dLat = (lat2 - lat1) * toRad
  var dLon = (lon2 - lon1) * toRad
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2)
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Create a dedup checker.
 * @param {object} deps - { dao, config } for DI
 */
function createDedupChecker(deps) {
  var dao = (deps && deps.dao) || null // $app.dao() — must be provided
  var config = (deps && deps.config) || require(__hooks + "/config.js")

  /**
   * Check if an event is a duplicate of an existing record.
   * @param {object} event - { date, latitude, longitude }
   * @returns {{ isDuplicate: boolean, duplicateId: string|null }}
   */
  function checkDuplicate(event) {
    if (!dao || !event.date || event.latitude == null || event.longitude == null) {
      return { isDuplicate: false, duplicateId: null }
    }

    // Parse event date and compute time window
    var eventDate = new Date(event.date)
    if (isNaN(eventDate.getTime())) {
      return { isDuplicate: false, duplicateId: null }
    }

    var toleranceMs = config.dedup.dateToleranceHours * 3600 * 1000
    var startDate = new Date(eventDate.getTime() - toleranceMs).toISOString()
    var endDate = new Date(eventDate.getTime() + toleranceMs).toISOString()

    try {
      var records = dao.findRecordsByFilter(
        "events",
        "date >= {:start} && date <= {:end}",
        "-created",
        50,
        0,
        { start: startDate, end: endDate }
      )

      if (!records || records.length === 0) {
        return { isDuplicate: false, duplicateId: null }
      }

      for (var i = 0; i < records.length; i++) {
        var recLat = records[i].getFloat("latitude")
        var recLon = records[i].getFloat("longitude")
        if (recLat === 0 && recLon === 0) continue

        var dist = haversineMeters(event.latitude, event.longitude, recLat, recLon)
        if (dist < config.dedup.radiusMeters) {
          return { isDuplicate: true, duplicateId: records[i].getId() }
        }
      }
    } catch (e) {
      // Dedup failure is non-fatal
      if (typeof console !== "undefined") console.log("Dedup warning: " + e.message)
    }

    return { isDuplicate: false, duplicateId: null }
  }

  return { checkDuplicate: checkDuplicate }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { createDedupChecker: createDedupChecker, haversineMeters: haversineMeters }
}
