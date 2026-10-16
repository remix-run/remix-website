-- Spreads requests across a pool of client IPs so the app's per-IP rate limit
-- (1,000 requests per 2 minutes) stays active without rejecting load.
local pool = 4000
local counter = 0

request = function()
  counter = counter + 1
  local n = counter % pool
  wrk.headers["X-Forwarded-For"] = string.format(
    "10.%d.%d.%d", math.floor(n / 65536) % 256, math.floor(n / 256) % 256, n % 256
  )
  return wrk.format()
end
