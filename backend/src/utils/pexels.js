// Shared Pexels image search utility — rotates across multiple API keys on
// rate-limit (429) or failure, and caches results per query so templates and
// pages don't re-fetch identical images on every load.

const KEY_SLOTS = [1, 2, 3, 4, 5, 6, 7];
const REQUEST_TIMEOUT_MS = 10000;

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const cache = new Map(); // key: `${query}|${perPage}|${orientation}` -> { at, data }
const inflight = new Map(); // key -> Promise<data>

let keyIndex = 0;

function getKeys() {
  return KEY_SLOTS
    .map((n) => process.env[`PEXELS_API_KEY_${n}`])
    .filter(Boolean);
}

function nextKey() {
  const keys = getKeys();
  if (keys.length === 0) return null;
  const key = keys[keyIndex % keys.length];
  keyIndex += 1;
  return key;
}

function normalizeQuery(query) {
  return String(query || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function mapPhoto(p) {
  return {
    id: p.id,
    url: p.src.large2x || p.src.large,
    thumbnail: p.src.medium,
    width: p.width,
    height: p.height,
    alt: p.alt || '',
    photographer: p.photographer,
    photographerUrl: p.photographer_url,
  };
}

// Searches Pexels for `query`, trying each configured key in turn if a
// request is rate-limited (429) or otherwise fails, and caches the result.
async function searchImages(query, { perPage = 12, orientation, page = 1 } = {}) {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) return [];
  const cacheKey = `${normalizedQuery}|${perPage}|${orientation || ''}|${page}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.data;
  if (inflight.has(cacheKey)) return inflight.get(cacheKey);

  const keys = getKeys();
  if (keys.length === 0) {
    throw new Error('No PEXELS_API_KEY_* configured.');
  }

  const params = new URLSearchParams({ query: normalizedQuery, per_page: String(perPage), page: String(page) });
  if (orientation) params.set('orientation', orientation);
  const url = `https://api.pexels.com/v1/search?${params.toString()}`;

  const request = (async () => {
    let lastError;
    for (let attempt = 0; attempt < keys.length; attempt++) {
      const key = nextKey();
      try {
        const resp = await fetch(url, {
          headers: { Authorization: key },
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        if (resp.status === 429) {
          lastError = new Error('Pexels rate limit hit, rotating key.');
          continue;
        }
        if (!resp.ok) {
          lastError = new Error(`Pexels request failed: ${resp.status}`);
          continue;
        }
        const data = await resp.json();
        const photos = (data.photos || []).map(mapPhoto);
        cache.set(cacheKey, { at: Date.now(), data: photos });
        return photos;
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError || new Error('Pexels search failed on all keys.');
  })();

  inflight.set(cacheKey, request);
  try {
    return await request;
  } finally {
    inflight.delete(cacheKey);
  }
}

// Convenience helper: first image for a query, or null.
async function firstImage(query, opts) {
  const results = await searchImages(query, { ...opts, perPage: 1 });
  return results[0] || null;
}

module.exports = { searchImages, firstImage };
