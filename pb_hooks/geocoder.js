// pb_hooks/geocoder.js
// Nominatim geocoding — deterministic coordinates from venue+city

/**
 * Create a geocoder with dependency injection for testing.
 * @param {object} deps - { httpSend, config }
 */
function createGeocoder(deps) {
  var httpSend = (deps && deps.httpSend) || function(opts) { return $http.send(opts) }
  var config = (deps && deps.config) || require(__hooks + "/config.js")

  var cache = {} // simple in-memory cache for this request

  /**
   * Geocode a venue+city string via Nominatim.
   * @param {string|null} venue
   * @param {string|null} city
   * @returns {{ lat: number, lon: number } | null}
   */
  function geocode(venue, city) {
    if (!venue && !city) return null

    var query = [venue, city].filter(Boolean).join(", ")
    if (cache[query]) return cache[query]

    try {
      var res = httpSend({
        url: config.nominatim.baseUrl + "/search?format=json&limit=1&q=" + encodeURIComponent(query),
        method: "GET",
        headers: { "user-agent": config.nominatim.userAgent },
        timeout: config.nominatim.timeoutSeconds,
      })

      if (res.statusCode === 200 && res.json && res.json.length > 0) {
        var result = {
          lat: parseFloat(res.json[0].lat),
          lon: parseFloat(res.json[0].lon),
        }
        cache[query] = result
        return result
      }
    } catch (e) {
      // Geocoding failure is non-fatal — log and continue
      if (typeof console !== "undefined") console.log("Geocoder warning: " + e.message)
    }

    return null
  }

  return { geocode: geocode }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { createGeocoder: createGeocoder }
}
